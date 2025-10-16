from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Esto permite que React se conecte

# Datos DIRECTAMENTE en el código (fácil de entender)
quiz_data = {
    "levels": [
        {
            "id": 1,
            "name": "BÁSICO",
            "description": "Nivel básico de SST",
            "modules": [
                {
                    "id": 101,
                    "name": "Fundamentos de SST",
                    "questions": [
                        {
                            "id": 1,
                            "question_text": "¿Cuál es el principal objetivo de la SST?",
                            "option_a": "Aumentar productividad",
                            "option_b": "Prevenir accidentes laborales",
                            "option_c": "Reducir costos",
                            "option_d": "Mejorar calidad de vida",
                            "correct_answer": "b"
                        }
                    ]
                }
            ]
        }
    ]
}

# Ruta de prueba
@app.route('/')
def home():
    return jsonify({"message": "✅ Backend funcionando!", "status": "OK"})

# Obtener niveles
@app.route('/api/levels', methods=['GET'])
def get_levels():
    return jsonify(quiz_data["levels"])

# Obtener preguntas de un módulo
@app.route('/api/modules/<int:module_id>/questions', methods=['GET'])
def get_questions(module_id):
    for level in quiz_data["levels"]:
        for module in level["modules"]:
            if module["id"] == module_id:
                return jsonify(module["questions"])
    return jsonify({"error": "Módulo no encontrado"}), 404

# Enviar respuestas
@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    data = request.get_json()
    print("Respuestas recibidas:", data)
    
    # Respuesta simple de prueba
    return jsonify({
        "score": 1,
        "total": 1, 
        "message": "Quiz evaluado correctamente"
    })

if __name__ == '__main__':
    print("🚀 Iniciando servidor Flask...")
    print("📡 URL: http://localhost:8000")
    print("✅ Endpoints:")
    print("   - GET  /api/levels")
    print("   - GET  /api/modules/101/questions") 
    print("   - POST /api/quiz/submit")
    app.run(debug=True, port=8000, host='0.0.0.0')