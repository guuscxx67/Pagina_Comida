"""
Backend Flask para Comida Casera
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Config
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///comida.db')
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu-clave-secreta')

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Models
class Usuario(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    telefono = db.Column(db.String(20))
    es_admin = db.Column(db.Boolean, default=False)
    fecha_creacion = db.Column(db.DateTime, default=datetime.utcnow)

class Pedido(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('usuario.id'), nullable=False)
    tipo = db.Column(db.String(20), nullable=False)  # 'recogida' o 'reserva'
    estado = db.Column(db.String(20), default='pendiente')  # pendiente, confirmado, completado
    total = db.Column(db.Float, nullable=False)
    fecha_pedido = db.Column(db.DateTime, default=datetime.utcnow)
    fecha_recogida = db.Column(db.DateTime)
    items = db.Column(db.JSON)
    notas = db.Column(db.String(500))

def pedido_to_dict(p: Pedido):
    return {
        'id': p.id,
        'usuario_id': p.usuario_id,
        'tipo': p.tipo,
        'estado': p.estado,
        'total': p.total,
        'fecha_pedido': p.fecha_pedido.isoformat() if p.fecha_pedido else None,
        'fecha_recogida': p.fecha_recogida.isoformat() if p.fecha_recogida else None,
        'items': p.items or [],
        'notas': p.notas or ''
    }

# Routes
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}

    required = ['nombre', 'email', 'password']
    if any(not data.get(k) for k in required):
        return jsonify({'error': 'nombre, email y password son obligatorios'}), 400

    if Usuario.query.filter_by(email=data['email']).first():
        return jsonify({'error': 'Email ya registrado'}), 400

    usuario = Usuario(
        nombre=data['nombre'],
        email=data['email'],
        password=bcrypt.generate_password_hash(data['password']).decode(),
        telefono=data.get('telefono', ''),
        es_admin=bool(data.get('es_admin', False))
    )

    db.session.add(usuario)
    db.session.commit()

    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'email': usuario.email,
        'es_admin': usuario.es_admin
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    usuario = Usuario.query.filter_by(email=data.get('email')).first()

    if not usuario or not bcrypt.check_password_hash(usuario.password, data.get('password', '')):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    return jsonify({
        'id': usuario.id,
        'nombre': usuario.nombre,
        'email': usuario.email,
        'es_admin': usuario.es_admin
    }), 200

@app.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    data = request.json or {}

    if not data.get('usuario_id') or not data.get('tipo') or data.get('total') is None:
        return jsonify({'error': 'usuario_id, tipo y total son obligatorios'}), 400

    if data['tipo'] not in ['recogida', 'reserva']:
        return jsonify({'error': 'tipo inválido'}), 400

    fecha_recogida = None
    if data.get('fecha_recogida'):
        try:
            fecha_recogida = datetime.fromisoformat(str(data['fecha_recogida']).replace('Z', ''))
        except ValueError:
            return jsonify({'error': 'fecha_recogida inválida'}), 400

    pedido = Pedido(
        usuario_id=data['usuario_id'],
        tipo=data['tipo'],
        total=float(data['total']),
        fecha_recogida=fecha_recogida,
        items=data.get('items', []),
        notas=data.get('notas', '')
    )

    db.session.add(pedido)
    db.session.commit()

    return jsonify({'id': pedido.id, 'estado': pedido.estado}), 201

@app.route('/api/pedidos/<int:pedido_id>', methods=['GET'])
def obtener_pedido(pedido_id):
    pedido = db.session.get(Pedido, pedido_id)
    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(pedido_to_dict(pedido)), 200

@app.route('/api/pedidos/<int:pedido_id>', methods=['PUT'])
def actualizar_pedido(pedido_id):
    data = request.json or {}
    pedido = db.session.get(Pedido, pedido_id)

    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    estado = data.get('estado')
    if estado and estado not in ['pendiente', 'confirmado', 'completado', 'cancelado']:
        return jsonify({'error': 'Estado inválido'}), 400

    pedido.estado = estado or pedido.estado
    db.session.commit()

    return jsonify({'id': pedido.id, 'estado': pedido.estado}), 200

@app.route('/api/pedidos/usuario/<int:usuario_id>', methods=['GET'])
def obtener_pedidos_usuario(usuario_id):
    pedidos = Pedido.query.filter_by(usuario_id=usuario_id).order_by(Pedido.fecha_pedido.desc()).all()
    return jsonify([pedido_to_dict(p) for p in pedidos]), 200

# Admin
@app.route('/api/admin/pedidos', methods=['GET'])
def admin_listar_pedidos():
    admin_id = request.args.get('admin_id', type=int)
    admin = db.session.get(Usuario, admin_id) if admin_id else None
    if not admin or not admin.es_admin:
        return jsonify({'error': 'No autorizado'}), 403

    pedidos = Pedido.query.order_by(Pedido.fecha_pedido.desc()).all()
    return jsonify([pedido_to_dict(p) for p in pedidos]), 200

@app.route('/api/admin/pedidos/<int:pedido_id>/estado', methods=['PUT'])
def admin_actualizar_estado(pedido_id):
    data = request.json or {}
    admin_id = data.get('admin_id')
    nuevo_estado = data.get('estado')

    admin = db.session.get(Usuario, admin_id) if admin_id else None
    if not admin or not admin.es_admin:
        return jsonify({'error': 'No autorizado'}), 403

    if nuevo_estado not in ['pendiente', 'confirmado', 'completado', 'cancelado']:
        return jsonify({'error': 'Estado inválido'}), 400

    pedido = db.session.get(Pedido, pedido_id)
    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    pedido.estado = nuevo_estado
    db.session.commit()
    return jsonify({'id': pedido.id, 'estado': pedido.estado}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, port=5000)
