"""
Backend Flask para Comida Casera - Con MongoDB
"""
from flask import Flask, request, jsonify, make_response
from flask_bcrypt import Bcrypt
from pymongo import MongoClient
from pymongo.errors import PyMongoError
from bson.objectid import ObjectId
from datetime import datetime
from werkzeug.utils import secure_filename
import json
import os
import re
import uuid
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

# Ruta a la carpeta public del frontend para imágenes
FRONTEND_PUBLIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'frontend', 'public')
INSTANCE_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'instance')
LOCAL_AUTH_FILE = os.path.join(INSTANCE_DIR, 'auth_users.json')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'gif'}
EMAIL_REGEX = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]{2,}$')
PHONE_REGEX = re.compile(r'^\d{10,12}$')
PASSWORD_REGEX = re.compile(r'^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_instance_dir():
    os.makedirs(INSTANCE_DIR, exist_ok=True)

def load_local_users():
    ensure_instance_dir()
    if not os.path.exists(LOCAL_AUTH_FILE):
        return []

    try:
        with open(LOCAL_AUTH_FILE, 'r', encoding='utf-8') as file:
            data = json.load(file)
            return data if isinstance(data, list) else []
    except (OSError, json.JSONDecodeError):
        return []

def save_local_users(users):
    ensure_instance_dir()
    with open(LOCAL_AUTH_FILE, 'w', encoding='utf-8') as file:
        json.dump(users, file, ensure_ascii=True, indent=2)

def find_local_user_by_email(email):
    if not email:
        return None

    normalized_email = str(email).strip().lower()
    for user in load_local_users():
        if str(user.get('email', '')).strip().lower() == normalized_email:
            return user
    return None

def find_local_user_by_id(user_id):
    if not user_id:
        return None

    for user in load_local_users():
        if str(user.get('id')) == str(user_id):
            return user
    return None

def create_local_user(nombre, email, password, telefono='', es_admin=False):
    users = load_local_users()
    normalized_email = str(email).strip().lower()

    if any(str(user.get('email', '')).strip().lower() == normalized_email for user in users):
        return None

    user = {
        'id': uuid.uuid4().hex,
        'nombre': nombre,
        'email': normalized_email,
        'password': bcrypt.generate_password_hash(password).decode(),
        'telefono': telefono,
        'direccion_favorita': {
            'calle': '',
            'numero_exterior': '',
            'numero_interior': '',
            'colonia': '',
            'codigo_postal': '',
            'referencia': ''
        },
        'es_admin': bool(es_admin),
        'fecha_creacion': datetime.utcnow().isoformat()
    }
    users.append(user)
    save_local_users(users)
    return user

def ensure_local_admin():
    if find_local_user_by_email('admin@test.com'):
        return
    create_local_user('Admin', 'admin@test.com', '123456', es_admin=True)

def get_user_by_email(email):
    if usuarios_col is not None:
        return usuarios_col.find_one({'email': str(email).strip().lower()})
    return find_local_user_by_email(email)

def get_user_by_id(user_id):
    if usuarios_col is not None:
        try:
            return usuarios_col.find_one({'_id': ObjectId(user_id)}) if user_id else None
        except:
            return None
    return find_local_user_by_id(user_id)

def update_local_user(user_id, updates):
    users = load_local_users()

    for index, user in enumerate(users):
        if str(user.get('id')) != str(user_id):
            continue

        users[index] = {**user, **updates}
        save_local_users(users)
        return users[index]

    return None

def is_valid_email(email):
    return bool(EMAIL_REGEX.match(str(email).strip().lower()))

def is_valid_phone(phone):
    return bool(PHONE_REGEX.match(str(phone).strip()))

def is_valid_password(password):
    return bool(PASSWORD_REGEX.match(str(password)))

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
platos_estrella_col = db['platos_estrella'] if db is not None else None

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
        'direccion_favorita': u.get('direccion_favorita', {
            'calle': '',
            'numero_exterior': '',
            'numero_interior': '',
            'colonia': '',
            'codigo_postal': '',
            'referencia': ''
        }),
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
        'direccion': p.get('direccion', None),
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

def plato_estrella_to_dict(p):
    """Convierte un documento PlatoEstrella de MongoDB a dict"""
    if not p:
        return None
    return {
        'id': str(p['_id']) if '_id' in p else str(p.get('id')),
        'nombre': p.get('nombre', ''),
        'descripcion': p.get('descripcion', ''),
        'precio': p.get('precio', 0),
        'imagen': p.get('imagen', ''),
        'orden': p.get('orden', 0),
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

PLATOS_ESTRELLA_INICIALES = [
    {'nombre': 'Comida Completa del Dia', 'descripcion': 'Sopa, guiso, arroz, frijoles y tortillas', 'precio': 110, 'imagen': '', 'orden': 1},
    {'nombre': 'Pollo en Mole',           'descripcion': 'Mole casero con pollo, arroz y tortillas',  'precio': 95,  'imagen': '', 'orden': 2},
    {'nombre': 'Enchiladas Verdes',       'descripcion': 'Enchiladas con salsa verde, crema y queso', 'precio': 85,  'imagen': '', 'orden': 3},
]

# ============ Routes — Auth ============

@app.route('/api/register', methods=['POST'])
def register():
    data = request.json or {}

    required = ['nombre', 'email', 'password']
    if any(not data.get(k) for k in required):
        return jsonify({'error': 'nombre, email y password son obligatorios'}), 400

    email = str(data['email']).strip().lower()

    # Verificar si el email ya existe
    if get_user_by_email(email):
        return jsonify({'error': 'Email ya registrado'}), 400

    if usuarios_col is None:
        usuario = create_local_user(
            data['nombre'],
            email,
            data['password'],
            data.get('telefono', ''),
            data.get('es_admin', False)
        )

        return jsonify({
            'id': usuario['id'],
            'nombre': usuario['nombre'],
            'email': usuario['email'],
            'telefono': usuario.get('telefono', ''),
            'direccion_favorita': usuario.get('direccion_favorita', {
                'calle': '',
                'numero_exterior': '',
                'numero_interior': '',
                'colonia': '',
                'codigo_postal': '',
                'referencia': ''
            }),
            'es_admin': usuario['es_admin']
        }), 201

    usuario = {
        'nombre': data['nombre'],
        'email': email,
        'password': bcrypt.generate_password_hash(data['password']).decode(),
        'telefono': data.get('telefono', ''),
        'direccion_favorita': {
            'calle': '',
            'numero_exterior': '',
            'numero_interior': '',
            'colonia': '',
            'codigo_postal': '',
            'referencia': ''
        },
        'es_admin': bool(data.get('es_admin', False)),
        'fecha_creacion': datetime.utcnow()
    }

    result = usuarios_col.insert_one(usuario)

    return jsonify({
        'id': str(result.inserted_id),
        'nombre': usuario['nombre'],
        'email': usuario['email'],
        'telefono': usuario.get('telefono', ''),
        'direccion_favorita': usuario.get('direccion_favorita', {
            'calle': '',
            'numero_exterior': '',
            'numero_interior': '',
            'colonia': '',
            'codigo_postal': '',
            'referencia': ''
        }),
        'es_admin': usuario['es_admin']
    }), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json or {}
    usuario = get_user_by_email(data.get('email'))

    if not usuario or not bcrypt.check_password_hash(usuario['password'], data.get('password', '')):
        return jsonify({'error': 'Credenciales inválidas'}), 401

    return jsonify({
        'id': str(usuario['_id']) if '_id' in usuario else str(usuario['id']),
        'nombre': usuario['nombre'],
        'email': usuario['email'],
        'telefono': usuario.get('telefono', ''),
        'direccion_favorita': usuario.get('direccion_favorita', {
            'calle': '',
            'numero_exterior': '',
            'numero_interior': '',
            'colonia': '',
            'codigo_postal': '',
            'referencia': ''
        }),
        'es_admin': usuario['es_admin']
    }), 200

@app.route('/api/usuarios/<usuario_id>', methods=['PUT'])
def actualizar_usuario(usuario_id):
    data = request.json or {}
    usuario = get_user_by_id(usuario_id)

    if not usuario:
        return jsonify({'error': 'Usuario no encontrado'}), 404

    nombre = str(data.get('nombre', '')).strip()
    email = str(data.get('email', '')).strip().lower()
    telefono = str(data.get('telefono', '')).strip()
    password = str(data.get('password', '')).strip()
    direccion = data.get('direccion_favorita') or {}

    if not nombre or not email:
        return jsonify({'error': 'Nombre y email son obligatorios'}), 400

    if len(nombre) < 2:
        return jsonify({'error': 'El nombre debe tener al menos 2 caracteres'}), 400

    if not is_valid_email(email):
        return jsonify({'error': 'Ingresa un correo valido'}), 400

    if not is_valid_phone(telefono):
        return jsonify({'error': 'El telefono debe tener solo numeros y entre 10 y 12 digitos'}), 400

    if password and not is_valid_password(password):
        return jsonify({'error': 'La contrasena debe tener minimo 8 caracteres, una mayuscula, un numero y un caracter especial'}), 400

    existente = get_user_by_email(email)
    if existente:
        existente_id = str(existente['_id']) if '_id' in existente else str(existente.get('id'))
        if existente_id != str(usuario_id):
            return jsonify({'error': 'El correo ya esta registrado por otro usuario'}), 400

    update_data = {
        'nombre': nombre,
        'email': email,
        'telefono': telefono,
        'direccion_favorita': {
            'calle': str(direccion.get('calle', '')).strip(),
            'numero_exterior': str(direccion.get('numero_exterior', '')).strip(),
            'numero_interior': str(direccion.get('numero_interior', '')).strip(),
            'colonia': str(direccion.get('colonia', '')).strip(),
            'codigo_postal': str(direccion.get('codigo_postal', '')).strip(),
            'referencia': str(direccion.get('referencia', '')).strip(),
        }
    }

    if password:
        update_data['password'] = bcrypt.generate_password_hash(password).decode()

    if usuarios_col is None:
        usuario_actualizado = update_local_user(usuario_id, update_data)
        if not usuario_actualizado:
            return jsonify({'error': 'Usuario no encontrado'}), 404
        return jsonify(usuario_to_dict(usuario_actualizado)), 200

    try:
        usuarios_col.update_one({'_id': ObjectId(usuario_id)}, {'$set': update_data})
        usuario_actualizado = usuarios_col.find_one({'_id': ObjectId(usuario_id)})
    except:
        return jsonify({'error': 'ID de usuario invalido'}), 400

    return jsonify(usuario_to_dict(usuario_actualizado)), 200

# ============ Routes — Pedidos ============

@app.route('/api/pedidos', methods=['POST'])
def crear_pedido():
    data = request.json or {}

    if not data.get('usuario_id') or not data.get('tipo') or data.get('total') is None:
        return jsonify({'error': 'usuario_id, tipo y total son obligatorios'}), 400

    if data['tipo'] not in ['recogida', 'reserva', 'domicilio']:
        return jsonify({'error': 'tipo inválido'}), 400

    if data['tipo'] == 'domicilio':
        direccion = data.get('direccion')
        if not direccion or not direccion.get('calle') or not direccion.get('numero_exterior') or not direccion.get('colonia') or not direccion.get('telefono_contacto'):
            return jsonify({'error': 'Para pedidos a domicilio se requiere calle, numero_exterior, colonia y telefono_contacto'}), 400

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
        'notas': data.get('notas', ''),
        'direccion': data.get('direccion', None),
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

# ============ Routes — Platos Estrella (público) ============

@app.route('/api/platos-estrella', methods=['GET'])
def listar_platos_estrella():
    if platos_estrella_col is None:
        return jsonify({'error': 'Base de datos no disponible'}), 503
    platos = list(platos_estrella_col.find().sort('orden', 1))
    return jsonify([plato_estrella_to_dict(p) for p in platos]), 200

# ============ Routes — Admin Pedidos ============

@app.route('/api/admin/pedidos', methods=['GET'])
def admin_listar_pedidos():
    admin_id = request.args.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
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
        admin = get_user_by_id(admin_id)
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

@app.route('/api/admin/pedidos/<pedido_id>', methods=['DELETE'])
def admin_eliminar_pedido(pedido_id):
    admin_id = request.args.get('admin_id')

    try:
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    try:
        pedido = pedidos_col.find_one({'_id': ObjectId(pedido_id)})
    except:
        return jsonify({'error': 'ID de pedido inválido'}), 400

    if not pedido:
        return jsonify({'error': 'Pedido no encontrado'}), 404

    pedidos_col.delete_one({'_id': ObjectId(pedido_id)})
    return jsonify({'ok': True}), 200

# ============ Routes — Admin Recetas ============

@app.route('/api/admin/recetas', methods=['POST'])
def admin_crear_receta():
    data = request.json or {}
    admin_id = data.get('admin_id')

    try:
        admin = get_user_by_id(admin_id)
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
        admin = get_user_by_id(admin_id)
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
        admin = get_user_by_id(admin_id)
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
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403

    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    recetas = list(recetas_col.find().sort([('categoria', 1), ('nombre', 1)]))
    return jsonify([receta_to_dict(r) for r in recetas]), 200

# ============ Routes — Admin Platos Estrella ============

@app.route('/api/admin/platos-estrella', methods=['GET'])
def admin_listar_platos_estrella():
    admin_id = request.args.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        admin = None
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403
    platos = list(platos_estrella_col.find().sort('orden', 1))
    return jsonify([plato_estrella_to_dict(p) for p in platos]), 200

@app.route('/api/admin/platos-estrella', methods=['POST'])
def admin_crear_plato_estrella():
    data = request.json or {}
    admin_id = data.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403
    if not data.get('nombre') or data.get('precio') is None:
        return jsonify({'error': 'nombre y precio son obligatorios'}), 400
    plato = {
        'nombre': data['nombre'],
        'descripcion': data.get('descripcion', ''),
        'precio': float(data['precio']),
        'imagen': data.get('imagen', ''),
        'orden': int(data.get('orden', 0)),
        'fecha_creacion': datetime.utcnow()
    }
    result = platos_estrella_col.insert_one(plato)
    return jsonify(plato_estrella_to_dict({**plato, '_id': result.inserted_id})), 201

@app.route('/api/admin/platos-estrella/<plato_id>', methods=['PUT'])
def admin_actualizar_plato_estrella(plato_id):
    data = request.json or {}
    admin_id = data.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        plato = platos_estrella_col.find_one({'_id': ObjectId(plato_id)})
    except:
        return jsonify({'error': 'ID de plato inválido'}), 400
    if not plato:
        return jsonify({'error': 'Plato estrella no encontrado'}), 404
    update_data = {}
    if data.get('nombre') is not None:
        update_data['nombre'] = data['nombre']
    if data.get('descripcion') is not None:
        update_data['descripcion'] = data['descripcion']
    if data.get('precio') is not None:
        update_data['precio'] = float(data['precio'])
    if data.get('imagen') is not None:
        update_data['imagen'] = data['imagen']
    if data.get('orden') is not None:
        update_data['orden'] = int(data['orden'])
    if update_data:
        platos_estrella_col.update_one({'_id': ObjectId(plato_id)}, {'$set': update_data})
    plato_actualizado = platos_estrella_col.find_one({'_id': ObjectId(plato_id)})
    return jsonify(plato_estrella_to_dict(plato_actualizado)), 200

@app.route('/api/admin/platos-estrella/<plato_id>', methods=['DELETE'])
def admin_eliminar_plato_estrella(plato_id):
    admin_id = request.args.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403
    try:
        plato = platos_estrella_col.find_one({'_id': ObjectId(plato_id)})
    except:
        return jsonify({'error': 'ID de plato inválido'}), 400
    if not plato:
        return jsonify({'error': 'Plato estrella no encontrado'}), 404
    platos_estrella_col.delete_one({'_id': ObjectId(plato_id)})
    return jsonify({'ok': True}), 200

# ============ Routes — Imágenes ============

@app.route('/api/imagenes', methods=['GET'])
def listar_imagenes():
    """Lista todas las imágenes disponibles en frontend/public"""
    imagenes = []
    try:
        for f in os.listdir(FRONTEND_PUBLIC_DIR):
            if allowed_file(f):
                imagenes.append(f)
        imagenes.sort()
    except OSError:
        return jsonify({'error': 'No se pudo leer la carpeta de imágenes'}), 500
    return jsonify(imagenes), 200

@app.route('/api/admin/imagenes/subir', methods=['POST'])
def admin_subir_imagen():
    """Sube una imagen a frontend/public"""
    admin_id = request.form.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        return jsonify({'error': 'No autorizado'}), 403
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    if 'imagen' not in request.files:
        return jsonify({'error': 'No se envió ninguna imagen'}), 400

    file = request.files['imagen']
    if file.filename == '':
        return jsonify({'error': 'No se seleccionó ningún archivo'}), 400

    if not allowed_file(file.filename):
        return jsonify({'error': 'Tipo de archivo no permitido. Usa: png, jpg, jpeg, webp, gif'}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(FRONTEND_PUBLIC_DIR, filename)

    # Si ya existe, agregar sufijo numérico
    if os.path.exists(filepath):
        name, ext = os.path.splitext(filename)
        counter = 1
        while os.path.exists(filepath):
            filename = f"{name}_{counter}{ext}"
            filepath = os.path.join(FRONTEND_PUBLIC_DIR, filename)
            counter += 1

    file.save(filepath)
    return jsonify({'filename': filename}), 201

# ============ Routes — Admin Dashboard ============

@app.route('/api/admin/dashboard', methods=['GET'])
def admin_dashboard():
    admin_id = request.args.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        admin = None
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    total_pedidos = pedidos_col.count_documents({})
    pedidos_pendientes = pedidos_col.count_documents({'estado': 'pendiente'})
    pedidos_confirmados = pedidos_col.count_documents({'estado': 'confirmado'})
    pedidos_completados = pedidos_col.count_documents({'estado': 'completado'})
    pedidos_cancelados = pedidos_col.count_documents({'estado': 'cancelado'})

    total_recetas = recetas_col.count_documents({})
    recetas_disponibles = recetas_col.count_documents({'disponible': True})
    total_usuarios = usuarios_col.count_documents({})
    total_platos_estrella = platos_estrella_col.count_documents({})

    # Ingresos totales (solo pedidos completados)
    pipeline_ingresos = [
        {'$match': {'estado': 'completado'}},
        {'$group': {'_id': None, 'total': {'$sum': '$total'}}}
    ]
    resultado_ingresos = list(pedidos_col.aggregate(pipeline_ingresos))
    ingresos_totales = resultado_ingresos[0]['total'] if resultado_ingresos else 0

    # Pedidos por tipo
    pipeline_tipos = [
        {'$group': {'_id': '$tipo', 'count': {'$sum': 1}}}
    ]
    pedidos_por_tipo = {r['_id']: r['count'] for r in pedidos_col.aggregate(pipeline_tipos)}

    # Ultimos 5 pedidos
    ultimos_pedidos = list(pedidos_col.find().sort('fecha_pedido', -1).limit(5))

    # Top 5 platos mas vendidos
    pipeline_top = [
        {'$match': {'estado': {'$in': ['completado', 'confirmado']}}},
        {'$unwind': '$items'},
        {'$group': {'_id': '$items.nombre', 'cantidad': {'$sum': '$items.cantidad'}, 'ingresos': {'$sum': {'$multiply': ['$items.precio', '$items.cantidad']}}}},
        {'$sort': {'cantidad': -1}},
        {'$limit': 5}
    ]
    top_platos = list(pedidos_col.aggregate(pipeline_top))

    return jsonify({
        'total_pedidos': total_pedidos,
        'pedidos_pendientes': pedidos_pendientes,
        'pedidos_confirmados': pedidos_confirmados,
        'pedidos_completados': pedidos_completados,
        'pedidos_cancelados': pedidos_cancelados,
        'total_recetas': total_recetas,
        'recetas_disponibles': recetas_disponibles,
        'total_usuarios': total_usuarios,
        'total_platos_estrella': total_platos_estrella,
        'ingresos_totales': ingresos_totales,
        'pedidos_por_tipo': pedidos_por_tipo,
        'ultimos_pedidos': [pedido_to_dict(p) for p in ultimos_pedidos],
        'top_platos': top_platos,
    }), 200

# ============ Routes — Admin Reportes ============

@app.route('/api/admin/reportes', methods=['GET'])
def admin_reportes():
    admin_id = request.args.get('admin_id')
    try:
        admin = get_user_by_id(admin_id)
    except:
        admin = None
    if not admin or not admin.get('es_admin', False):
        return jsonify({'error': 'No autorizado'}), 403

    # Ingresos por dia (ultimos 30 dias)
    from datetime import timedelta
    fecha_inicio = datetime.utcnow() - timedelta(days=30)

    pipeline_diario = [
        {'$match': {'estado': 'completado', 'fecha_pedido': {'$gte': fecha_inicio}}},
        {'$group': {
            '_id': {'$dateToString': {'format': '%Y-%m-%d', 'date': '$fecha_pedido'}},
            'ingresos': {'$sum': '$total'},
            'cantidad': {'$sum': 1}
        }},
        {'$sort': {'_id': 1}}
    ]
    ingresos_diarios = list(pedidos_col.aggregate(pipeline_diario))

    # Ingresos por categoria
    pipeline_categoria = [
        {'$match': {'estado': 'completado'}},
        {'$unwind': '$items'},
        {'$group': {
            '_id': '$items.categoria',
            'ingresos': {'$sum': {'$multiply': ['$items.precio', '$items.cantidad']}},
            'cantidad': {'$sum': '$items.cantidad'}
        }},
        {'$sort': {'ingresos': -1}}
    ]
    ingresos_por_categoria = list(pedidos_col.aggregate(pipeline_categoria))

    # Ingresos por tipo de pedido
    pipeline_tipo = [
        {'$match': {'estado': 'completado'}},
        {'$group': {
            '_id': '$tipo',
            'ingresos': {'$sum': '$total'},
            'cantidad': {'$sum': 1}
        }},
        {'$sort': {'ingresos': -1}}
    ]
    ingresos_por_tipo = list(pedidos_col.aggregate(pipeline_tipo))

    # Resumen general
    pipeline_total = [
        {'$match': {'estado': 'completado'}},
        {'$group': {
            '_id': None,
            'ingresos_totales': {'$sum': '$total'},
            'total_pedidos': {'$sum': 1},
            'ticket_promedio': {'$avg': '$total'}
        }}
    ]
    resumen = list(pedidos_col.aggregate(pipeline_total))
    resumen_data = resumen[0] if resumen else {'ingresos_totales': 0, 'total_pedidos': 0, 'ticket_promedio': 0}
    if '_id' in resumen_data:
        del resumen_data['_id']

    # Ingresos por mes (ultimos 12 meses)
    fecha_12m = datetime.utcnow() - timedelta(days=365)
    pipeline_mensual = [
        {'$match': {'estado': 'completado', 'fecha_pedido': {'$gte': fecha_12m}}},
        {'$group': {
            '_id': {'$dateToString': {'format': '%Y-%m', 'date': '$fecha_pedido'}},
            'ingresos': {'$sum': '$total'},
            'cantidad': {'$sum': 1}
        }},
        {'$sort': {'_id': 1}}
    ]
    ingresos_mensuales = list(pedidos_col.aggregate(pipeline_mensual))

    return jsonify({
        'resumen': resumen_data,
        'ingresos_diarios': ingresos_diarios,
        'ingresos_mensuales': ingresos_mensuales,
        'ingresos_por_categoria': ingresos_por_categoria,
        'ingresos_por_tipo': ingresos_por_tipo,
    }), 200

# ============ Health Check ============

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ok',
        'database': 'mongodb' if db is not None else 'local-auth-fallback'
    }), 200

if __name__ == '__main__':
    if db is not None:
        # Inicializar colecciones con datos si estan vacias
        if recetas_col.count_documents({}) == 0:
            recetas_col.insert_many(RECETAS_INICIALES)
            print(f'Insertadas {len(RECETAS_INICIALES)} recetas iniciales')

        if platos_estrella_col.count_documents({}) == 0:
            platos_estrella_col.insert_many(PLATOS_ESTRELLA_INICIALES)
            print(f'Insertados {len(PLATOS_ESTRELLA_INICIALES)} platos estrella iniciales')

        # Crear admin por defecto si no existe
        if usuarios_col.count_documents({'email': 'admin@test.com'}) == 0:
            admin = {
                'nombre': 'Admin',
                'email': 'admin@test.com',
                'password': bcrypt.generate_password_hash('123456').decode(),
                'telefono': '',
                'direccion_favorita': {
                    'calle': '',
                    'numero_exterior': '',
                    'numero_interior': '',
                    'colonia': '',
                    'codigo_postal': '',
                    'referencia': ''
                },
                'es_admin': True,
                'fecha_creacion': datetime.utcnow()
            }
            usuarios_col.insert_one(admin)
            print('Admin por defecto creado: admin@test.com / 123456')
    else:
        ensure_local_admin()
        print('Auth local habilitada: admin@test.com / 123456')

    print('Backend ejecutandose en http://localhost:5000')
    app.run(debug=True, port=5000)
