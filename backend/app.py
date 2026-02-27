"""
Backend Flask para Comida Casera
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
import json

app = Flask(__name__)

# Configurar CORS
CORS(app, origins=["http://localhost:4200", "http://localhost:3000"])

# Datos mockeados para demostración
MENU_ITEMS = [
    {
        "id": 1,
        "name": "Mole Poblano",
        "description": "Delicioso mole poblano con pollo, arroz y tortillas",
        "price": 110,
        "image": "mole-poblano.jpg",
        "category": "platos-principales"
    },
    {
        "id": 2,
        "name": "Chiles Rellenos",
        "description": "Chiles poblanos rellenos de queso con salsa de jitomate",
        "price": 95,
        "image": "chiles-rellenos.jpg",
        "category": "platos-principales"
    },
    {
        "id": 3,
        "name": "Tacos al Pastor",
        "description": "Tacos tradicionales al pastor con piña y cebolla",
        "price": 60,
        "image": "tacos-pastor.jpg",
        "category": "tacos"
    }
]

USERS = {
    "cliente1": {
        "id": 1,
        "name": "Cliente",
        "email": "cliente@comidacasera.mx",
        "phone": "(555) 123-4567",
        "orders": []
    }
}

# Rutas Health Check
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "Backend is running"}), 200

# Rutas de Menú
@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Obtener menú completo"""
    return jsonify({
        "success": True,
        "data": MENU_ITEMS,
        "count": len(MENU_ITEMS)
    }), 200

@app.route('/api/menu/<int:menu_id>', methods=['GET'])
def get_menu_item(menu_id):
    """Obtener un item del menú por ID"""
    item = next((item for item in MENU_ITEMS if item['id'] == menu_id), None)
    if item:
        return jsonify({"success": True, "data": item}), 200
    return jsonify({"success": False, "message": "Item not found"}), 404

@app.route('/api/menu/category/<category>', methods=['GET'])
def get_menu_by_category(category):
    """Obtener items del menú por categoría"""
    items = [item for item in MENU_ITEMS if item['category'] == category]
    return jsonify({
        "success": True,
        "data": items,
        "count": len(items)
    }), 200

# Rutas de Usuarios
@app.route('/api/user/<user_id>', methods=['GET'])
def get_user(user_id):
    """Obtener datos del usuario"""
    user = USERS.get(user_id)
    if user:
        return jsonify({"success": True, "data": user}), 200
    return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/user/<user_id>/profile', methods=['GET'])
def get_user_profile(user_id):
    """Obtener perfil del usuario"""
    user = USERS.get(user_id)
    if user:
        return jsonify({
            "success": True,
            "data": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
                "phone": user["phone"]
            }
        }), 200
    return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/user/<user_id>/profile', methods=['PUT'])
def update_user_profile(user_id):
    """Actualizar perfil del usuario"""
    user = USERS.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.json
    if 'name' in data:
        user['name'] = data['name']
    if 'email' in data:
        user['email'] = data['email']
    if 'phone' in data:
        user['phone'] = data['phone']

    return jsonify({"success": True, "data": user, "message": "Profile updated successfully"}), 200

# Rutas de Órdenes/Pedidos
@app.route('/api/user/<user_id>/orders', methods=['GET'])
def get_user_orders(user_id):
    """Obtener órdenes del usuario"""
    user = USERS.get(user_id)
    if user:
        return jsonify({
            "success": True,
            "data": user.get("orders", []),
            "count": len(user.get("orders", []))
        }), 200
    return jsonify({"success": False, "message": "User not found"}), 404

@app.route('/api/user/<user_id>/orders', methods=['POST'])
def create_order(user_id):
    """Crear una nueva orden"""
    user = USERS.get(user_id)
    if not user:
        return jsonify({"success": False, "message": "User not found"}), 404

    data = request.json
    new_order = {
        "id": len(user.get("orders", [])) + 1,
        "items": data.get("items", []),
        "total": data.get("total", 0),
        "status": "pending",
        "created_at": "2024-02-27T00:00:00Z"
    }

    if "orders" not in user:
        user["orders"] = []
    user["orders"].append(new_order)

    return jsonify({
        "success": True,
        "data": new_order,
        "message": "Order created successfully"
    }), 201

# Rutas de Reservas
@app.route('/api/reservations', methods=['POST'])
def create_reservation():
    """Crear una reserva"""
    data = request.json
    reservation = {
        "id": 1,
        "user_name": data.get("user_name"),
        "email": data.get("email"),
        "phone": data.get("phone"),
        "date": data.get("date"),
        "time": data.get("time"),
        "guests": data.get("guests", 1),
        "special_requests": data.get("special_requests", ""),
        "status": "confirmed",
        "created_at": "2024-02-27T00:00:00Z"
    }

    return jsonify({
        "success": True,
        "data": reservation,
        "message": "Reservation created successfully"
    }), 201

# Rutas de Contacto
@app.route('/api/contact', methods=['POST'])
def send_contact():
    """Enviar mensaje de contacto"""
    data = request.json

    # Validar datos
    required_fields = ['name', 'email', 'message']
    if not all(field in data for field in required_fields):
        return jsonify({
            "success": False,
            "message": "Missing required fields"
        }), 400

    contact_message = {
        "id": 1,
        "name": data.get("name"),
        "email": data.get("email"),
        "phone": data.get("phone", ""),
        "message": data.get("message"),
        "status": "received",
        "created_at": "2024-02-27T00:00:00Z"
    }

    return jsonify({
        "success": True,
        "data": contact_message,
        "message": "Message sent successfully"
    }), 201

# Manejo de errores
@app.errorhandler(404)
def not_found(error):
    """Manejar rutas no encontradas"""
    return jsonify({
        "success": False,
        "message": "Endpoint not found",
        "error": str(error)
    }), 404

@app.errorhandler(500)
def server_error(error):
    """Manejar errores internos del servidor"""
    return jsonify({
        "success": False,
        "message": "Internal server error",
        "error": str(error)
    }), 500

if __name__ == '__main__':
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )
