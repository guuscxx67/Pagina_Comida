"""
Backend Flask para Comida Casera - Con MongoDB
"""
from flask import Flask, request, jsonify, make_response
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# ── CORS manual (funciona con cualquier versión de Flask) ──────────────────
@app.before_request
def handle_preflight():
    if request.method == 'OPTIONS':
        res = make_response()
        res.headers['Access-Control-Allow-Origin'] = '*'
        res.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        res.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
        return res

@app.after_request
def add_cors_headers(response):
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
    response.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization'
    return response

# Config
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'tu-clave-secreta')
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB = os.getenv('MONGO_DB', 'pagina_comida')

bcrypt = Bcrypt(app)

# MongoDB Connection
try:
    mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000, socketTimeoutMS=10000)
    mongo_client.admin.command('ping')
    db = mongo_client[MONGO_DB]
    print(f"✓ Conectado a MongoDB: {MONGO_DB}")
except PyMongoError as e:
    print(f"✗ Error conectando a MongoDB: {e}")
    db = None

# Collections
usuarios_col = db['usuarios'] if db is not None else None
pedidos_col = db['pedidos'] if db is not None else None
recetas_col = db['recetas'] if db is not None else None

# Create indexes
if usuarios_col is not None:
    usuarios_col.create_index('email', unique=True)

# Helper functions
def usuario_to_dict(u):
    """Convierte un documento Usuario de MongoDB a dict"""
    if not u:
        return None
    return {
        'id': str(u['_id']) if '_id' in u else str(u.get('id')),
        'nombre': u.get('nombre', ''),
        'email': u.get('email', ''),
        'telefono': u.get('telefono', ''),
        'es_admin': u.get('es_admin', False),
    }

def pedido_to_dict(p):
    """Convierte un documento Pedido de MongoDB a dict"""
    if not p:
        return None
    fecha_pedido = p.get('fecha_pedido')
    if isinstance(fecha_pedido, datetime):
        fecha_pedido = fecha_pedido.isoformat()

    fecha_recogida = p.get('fecha_recogida')
    if isinstance(fecha_recogida, datetime):
        fecha_recogida = fecha_recogida.isoformat()

    return {
        'id': str(p['_id']) if '_id' in p else str(p.get('id')),
        'usuario_id': p.get('usuario_id'),
        'tipo': p.get('tipo', ''),
        'estado': p.get('estado', 'pendiente'),
        'total': p.get('total', 0),
        'fecha_pedido': fecha_pedido,
        'fecha_recogida': fecha_recogida,
        'items': p.get('items', []),
        'notas': p.get('notas', ''),
    }

def receta_to_dict(r):
    """Convierte un documento Receta de MongoDB a dict"""
    if not r:
        return None
    return {
        'id': str(r['_id']) if '_id' in r else str(r.get('id')),
        'nombre': r.get('nombre', ''),
        'descripcion': r.get('descripcion', ''),
        'precio': r.get('precio', 0),
        'categoria': r.get('categoria', 'General'),
        'disponible': r.get('disponible', True),
        'imagen': r.get('imagen', ''),
    }

# Data inicial
RECETAS_INICIALES = [
    {'nombre': 'Comida Completa del Día',  'descripcion': 'Sopa, guiso, arroz, frijoles y tortillas', 'precio': 110, 'categoria': 'Menú del Día', 'disponible': True, 'imagen': ''},
    {'nombre': 'Pollo en Mole',            'descripcion': 'Mole casero con pollo, arroz y tortillas', 'precio': 95,  'categoria': 'Especialidades', 'disponible': True, 'imagen': ''},
    {'nombre': 'Enchiladas Verdes',        'descripcion': 'Enchiladas con salsa verde, crema y queso', 'precio': 85,  'categoria': 'Especialidades', 'disponible': True, 'imagen': ''},
    {'nombre': 'Tamales (3 pzas)',         'descripcion': 'Tamales de rajas, pollo o dulce', 'precio': 75,  'categoria': 'Antojitos', 'disponible': True, 'imagen': ''},
    {'nombre': 'Caldo de Res',             'descripcion': 'Caldo de res con verduras y tortillas', 'precio': 90,  'categoria': 'Caldos y Sopas', 'disponible': True, 'imagen': ''},
    {'nombre': 'Sopa de Lima',             'descripcion': 'Sopa yucateca con pollo y tostadas', 'precio': 80,  'categoria': 'Caldos y Sopas', 'disponible': True, 'imagen': ''},
    {'nombre': 'Agua Fresca',              'descripcion': 'Jamaica, horchata o fruta de temporada', 'precio': 25,  'categoria': 'Bebidas', 'disponible': True, 'imagen': ''},
    {'nombre': 'Tortillas (10 pzas)',      'descripcion': 'Tortillas de maíz hechas a mano', 'precio': 20,  'categoria': 'Antojitos', 'disponible': True, 'imagen': ''},
]

# ============ Routes — Auth ============

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}

    required = ['nombre', 'email', 'password']
    if any(not data.get(k) for k in required):
        return jsonify({'error': 'nombre, email y password son obligatorios'}), 400

    # Verificar si el email ya existe
    if usuarios_col.find_one({'email': data['email']}):
        return jsonify({'error': 'Email ya registrado'}), 400

    usuario = {
        'nombre': data['nombre'],
        'email': data['email'],
        'password': bcrypt.generate_password_hash(data['password']).decode(),
        'telefono': data.get('telefono', ''),
        'es_admin': bool(data.get('es_admin', False)),
        'fecha_creacion': datetime.utcnow()
    }

    result = usuarios_col.insert_one(usuario)

    return jsonify({
        'id': str(result.inserted_id),
        'nombre': usuario['nombre'],
        'email': usuario['email'],
        'es_admin': usuario['es_admin']
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    usuario = usuarios_col.find_one({'email': data.get('email')})

    if not usuario or not bcrypt.check_password_hash(usuario['password'], data.get('password', '')):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    return jsonify({
        'id': str(usuario['_id']),
        'nombre': usuario['nombre'],
        'email': usuario['email'],
        'es_admin': usuario['es_admin']
    }), 200

# ============ Routes — Pedidos ============

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

    pedido = {
        'usuario_id': str(data['usuario_id']),
        'tipo': data['tipo'],
        'estado': 'pendiente',
        'total': float(data['total']),
        'fecha_pedido': datetime.utcnow(),
        'fecha_recogida': fecha_recogida,
        'items': data.get('items', []),
        'notas': data.get('notas', '')
    }

    result = pedidos_col.insert_one(pedido)

    return jsonify({'id': str(result.inserted_id), 'estado': pedido['estado']}), 201

@app.route('/api/pedidos/<pedido_id>', methods=['GET'])
def obtener_pedido(pedido_id):
    try:
        pedido = pedidos_col.find_one({'_id': ObjectId(pedido_id)})
    except:
        return jsonify({'error': 'ID de pedido inválido'}), 400

    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404
    return jsonify(pedido_to_dict(pedido)), 200

@app.route('/api/pedidos/<pedido_id>', methods=['PUT'])
def actualizar_pedido(pedido_id):
    data = request.json or {}

    try:
        pedido = pedidos_col.find_one({'_id': ObjectId(pedido_id)})
    except:
        return jsonify({'error': 'ID de pedido inválido'}), 400

    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    estado = data.get('estado')
    if estado and estado not in ['pendiente', 'confirmado', 'completado', 'cancelado']:
        return jsonify({'error': 'Estado inválido'}), 400

    update_data = {}
    if estado:
        update_data['estado'] = estado

    if update_data:
        pedidos_col.update_one({'_id': ObjectId(pedido_id)}, {'$set': update_data})

    pedido_actualizado = pedidos_col.find_one({'_id': ObjectId(pedido_id)})
    return jsonify({'id': str(pedido_actualizado['_id']), 'estado': pedido_actualizado['estado']}), 200

@app.route('/api/pedidos/usuario/<usuario_id>', methods=['GET'])
def obtener_pedidos_usuario(usuario_id):
    pedidos = list(pedidos_col.find({'usuario_id': str(usuario_id)}).sort('fecha_pedido', -1))
    return jsonify([pedido_to_dict(p) for p in pedidos]), 200

# ============ Routes — Recetas (público) ============

@app.route('/api/recetas', methods=['GET'])
def listar_recetas():
    if recetas_col is None:
        return jsonify({'error': 'Base de datos no disponible'}), 503
    recetas = list(recetas_col.find({'disponible': True}).sort([('categoria', 1), ('nombre', 1)]))
    return jsonify([receta_to_dict(r) for r in recetas]), 200

# ============ Routes — Admin Pedidos ============

@app.route('/api/admin/pedidos', methods=['GET'])
def admin_listar_pedidos():
    admin_id = request.args.get('admin_id')
    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        admin = None

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    pedidos = list(pedidos_col.find().sort('fecha_pedido', -1))
    return jsonify([pedido_to_dict(p) for p in pedidos]), 200

@app.route('/api/admin/pedidos/<pedido_id>/estado', methods=['PUT'])
def admin_actualizar_estado(pedido_id):
    data = request.json or {}
    admin_id = data.get('admin_id')
    nuevo_estado = data.get('estado')

    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    if nuevo_estado not in ['pendiente', 'confirmado', 'completado', 'cancelado']:
        return jsonify({'error': 'Estado inválido'}), 400

    try:
        pedido = pedidos_col.find_one({'_id': ObjectId(pedido_id)})
    except:
        return jsonify({'error': 'ID de pedido inválido'}), 400

    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    pedidos_col.update_one({'_id': ObjectId(pedido_id)}, {'$set': {'estado': nuevo_estado}})
    return jsonify({'id': pedido_id, 'estado': nuevo_estado}), 200

# ============ Routes — Admin Recetas ============

@app.route('/api/admin/recetas', methods=['POST'])
def admin_crear_receta():
    data = request.json or {}
    admin_id = data.get('admin_id')

    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    if not data.get('nombre') or data.get('precio') is None:
        return jsonify({'error': 'nombre y precio son obligatorios'}), 400

    receta = {
        'nombre': data['nombre'],
        'descripcion': data.get('descripcion', ''),
        'precio': float(data['precio']),
        'categoria': data.get('categoria', 'General'),
        'disponible': bool(data.get('disponible', True)),
        'imagen': data.get('imagen', ''),
        'fecha_creacion': datetime.utcnow()
    }

    result = recetas_col.insert_one(receta)

    return jsonify(receta_to_dict({**receta, '_id': result.inserted_id})), 201

@app.route('/api/admin/recetas/<receta_id>', methods=['PUT'])
def admin_actualizar_receta(receta_id):
    data = request.json or {}
    admin_id = data.get('admin_id')

    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    try:
        receta = recetas_col.find_one({'_id': ObjectId(receta_id)})
    except:
        return jsonify({'error': 'ID de receta inválido'}), 400

    if not receta:
        return jsonify({'error': 'Receta no encontrada'}), 404

    update_data = {}
    if data.get('nombre') is not None:
        update_data['nombre'] = data['nombre']
    if data.get('descripcion') is not None:
        update_data['descripcion'] = data['descripcion']
    if data.get('precio') is not None:
        update_data['precio'] = float(data['precio'])
    if data.get('categoria') is not None:
        update_data['categoria'] = data['categoria']
    if data.get('disponible') is not None:
        update_data['disponible'] = bool(data['disponible'])
    if data.get('imagen') is not None:
        update_data['imagen'] = data['imagen']

    if update_data:
        recetas_col.update_one({'_id': ObjectId(receta_id)}, {'$set': update_data})

    receta_actualizada = recetas_col.find_one({'_id': ObjectId(receta_id)})
    return jsonify(receta_to_dict(receta_actualizada)), 200

@app.route('/api/admin/recetas/<receta_id>', methods=['DELETE'])
def admin_eliminar_receta(receta_id):
    admin_id = request.args.get('admin_id')

    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    try:
        receta = recetas_col.find_one({'_id': ObjectId(receta_id)})
    except:
        return jsonify({'error': 'ID de receta inválido'}), 400

    if not receta:
        return jsonify({'error': 'Receta no encontrada'}), 404

    recetas_col.delete_one({'_id': ObjectId(receta_id)})
    return jsonify({'ok': True}), 200

@app.route('/api/admin/recetas', methods=['GET'])
def admin_listar_recetas():
    admin_id = request.args.get('admin_id')

    try:
        admin = usuarios_col.find_one({'_id': ObjectId(admin_id)}) if admin_id else None
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    recetas = list(recetas_col.find().sort([('categoria', 1), ('nombre', 1)]))
    return jsonify([receta_to_dict(r) for r in recetas]), 200

# ============ Health Check ============

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'database': 'mongodb'}), 200

if __name__ == '__main__':
    if db is not None:
        # Inicializar colecciones con datos si están vacías
        if recetas_col.count_documents({}) == 0:
            recetas_col.insert_many(RECETAS_INICIALES)
            print(f"✓ Insertadas {len(RECETAS_INICIALES)} recetas iniciales")

        # Crear admin por defecto si no existe
        if usuarios_col.count_documents({'email': 'admin@test.com'}) == 0:
            admin = {
                'nombre': 'Admin',
                'email': 'admin@test.com',
                'password': bcrypt.generate_password_hash('123456').decode(),
                'telefono': '',
                'es_admin': True,
                'fecha_creacion': datetime.utcnow()
            }
            usuarios_col.insert_one(admin)
            print("✓ Admin por defecto creado: admin@test.com / 123456")

    print(f"🚀 Backend ejecutándose en http://localhost:5000")
    app.run(debug=True, port=5000)
