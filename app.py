from flask import Flask, request, jsonify, render_template, session, redirect, url_for
from flask_mysqldb import MySQL
from flask_cors import CORS, cross_origin
import mysql.connector
from datetime import datetime,date,time,timedelta
from MySQLdb import IntegrityError
from flask import Flask, jsonify, session
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import pandas as pd
import io
from flask import send_file


app = Flask(__name__)
CORS(app)

# Configuración de conexión a MySQL
app.config['MYSQL_HOST'] = 'bmep98y36qqqhmgejg4m-mysql.services.clever-cloud.com'
app.config['MYSQL_USER'] = 'u4acqco7y9j4mxli'
app.config['MYSQL_PASSWORD'] = 'aEylWzlm48xTommJxiFo'
app.config['MYSQL_DB'] = 'bmep98y36qqqhmgejg4m'
app.config['MYSQL_PORT'] = 3306 

app.config['JWT_SECRET_KEY'] = ''

mysql = MySQL(app)  
app.secret_key = "mysecretkey"
jwt = JWTManager(app) # Inicializa el JWTManager


# EXCEL
@app.route("/exportUsers", methods=["GET"])
def consultar_usuarios():
    if request.method == "GET": 
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM user")
            resultado = cur.fetchall()
            cur.close()

            # Convertir los resultados en un DataFrame de pandas
            columnas = ["id", "nombre", "identificacion", "correo", "telefono", "username", "password", "rol"]
            df = pd.DataFrame(resultado, columns=columnas)

            # Convertir el DataFrame a un archivo Excel en memoria
            output = io.BytesIO()
            with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
                df.to_excel(writer, index=False, sheet_name='Usuarios')
            output.seek(0)

            # Enviar el archivo Excel como respuesta
            return send_file(output, download_name="usuarios.xlsx", as_attachment=True)

        except Exception as error:
            print("Error al obtener los usuarios \n", traceback.format_exc())
            return jsonify({"mensaje": str(error)}), 500

@app.route("/exportar_reporte_citas", methods=["GET"])
def exportar_reporte_citas():
    try:
        cur = mysql.connection.cursor()
        query = """
            SELECT 'Psicologia' AS area, 
                   Nombre_Completo AS paciente, 
                   sede, 
                   fecha, 
                   hora, 
                   motivo AS sintoma
            FROM citas
            UNION ALL
            SELECT 'Enfermeria' AS area, 
                   Nombre_Completo AS paciente, 
                   sede, 
                   fecha, 
                   hora, 
                   motivo AS sintoma
            FROM citas_enfermeria
        """
        cur.execute(query)
        datos = cur.fetchall()
        columnas = ["Área", "Paciente", "Sede", "Fecha", "Hora", "Síntoma"]

        # Convertir hora en texto
        datos_limpios = []
        for fila in datos:
            fila = list(fila)
            hora = fila[4]
            if isinstance(hora, timedelta):
                total = hora.total_seconds()
                fila[4] = f"{int(total//3600):02}:{int((total%3600)//60):02}"
            datos_limpios.append(fila)

        df = pd.DataFrame(datos_limpios, columns=columnas)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Citas')
        output.seek(0)

        return send_file(output, download_name="reporte_citas.xlsx", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/exportar_reporte_recomendaciones", methods=["GET"])
def exportar_reporte_recomendaciones():
    try:
        cur = mysql.connection.cursor()
        query = """
            SELECT 'Psicologia' AS area,
                   nombre_estudiante AS paciente,
                   nombre_psicologo AS especialista,
                   recomendacion,
                   fecha
            FROM recomendaciones_psicologia
            UNION ALL
            SELECT 'Enfermeria' AS area,
                   nombre_estudiante AS paciente,
                   nombre_enfermero AS especialista,
                   recomendacion,
                   fecha_recomendacion AS fecha
            FROM recomendaciones_enfermeria
        """
        cur.execute(query)
        datos = cur.fetchall()
        columnas = ["Área", "Paciente", "Especialista", "Recomendación", "Fecha"]

        df = pd.DataFrame(datos, columns=columnas)

        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
            df.to_excel(writer, index=False, sheet_name='Recomendaciones')
        output.seek(0)

        return send_file(output, download_name="reporte_recomendaciones.xlsx", as_attachment=True)
    except Exception as e:
        return jsonify({"error": str(e)}), 500




# Rutas de mi API para gráfico
@app.route("/getAllUsers", methods=["GET"])
def consultar():
    if request.method == "GET": 
        try:
            cur = mysql.connection.cursor()
            cur.execute("SELECT * FROM user GROUP BY rol")
            resultado = cur.fetchall()
            cur.close()
            print(f"Resultado de la consulta: {resultado}")
            tabla = []
            for fila in resultado:
                print(fila)
                if len(fila) == 8:  # Asegúrate de que la tupla tiene 8 elementos
                    contenido = {
                        "id": fila[0],
                        "nombre": fila[1],
                        "identificacion": fila[2],
                        "correo": fila[3],
                        "telefono": fila[4],
                        "username": fila[5],
                        "password": fila[6],
                        "rol": fila[7]
                    }
                    tabla.append(contenido)
                else:
                    print(f"Fila con datos insuficientes: {fila}")
            return jsonify(tabla)
        except Exception as error:
            print("Error al obtener los usuarios \n", error)
            return jsonify({"mensaje": str(error)}), 500
        
        
# Ruta para grafica de cantidad de citas en psicologia
@app.route("/getcitaspsicologias", methods=["GET"])
def get_psychology_appointments():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT COUNT(*) AS total FROM citas")
        resultado = cur.fetchone()
        cur.close()
        total_appointments = resultado[0] if resultado else 0
        return jsonify({"total": total_appointments})
    except Exception as error:
        return jsonify({"mensaje": str(error)}), 500

# Ruta para grafica de cantidad de citas en enfermeria
@app.route("/getcitasenfermeria", methods=["GET"])
def get_nursing_appointments():
    try:
        cur = mysql.connection.cursor()
        cur.execute("SELECT COUNT(*) AS total FROM citas_enfermeria")
        resultado = cur.fetchone()
        cur.close()
        total_appointments = resultado[0] if resultado else 0
        return jsonify({"total": total_appointments})
    except Exception as error:
        return jsonify({"mensaje": str(error)}), 500
    
# Ruta para consultar todos los registros(ADMIN)
@cross_origin()
@app.route('/getAll', methods=['GET'])
def getAll():
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM user GROUP BY rol')  # Cambiado a 'user'
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            content = {
                'id': result[0], 
                'nombre': result[1], 
                'identificacion': result[2], 
                'correo': result[3], 
                'telefono': result[4], 
                'username': result[5], 
                'password': result[6], 
                'rol': result[7]
            }
            payload.append(content)
        return jsonify(payload)
    except Exception as e:
        print(e)
        return jsonify({"informacion": str(e)})
    

@app.route('/estadisticas_citas', methods=['GET'])
def get_estadisticas_citas():
    try:
        cur = mysql.connection.cursor()
        
        # Totales
        cur.execute("SELECT COUNT(*) FROM citas")
        total_psicologia = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM citas_enfermeria")
        total_enfermeria = cur.fetchone()[0]
        
        # Citas por mes (ejemplo)
        cur.execute("""
            SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, 
                   COUNT(*) as total 
            FROM citas 
            GROUP BY mes 
            ORDER BY mes DESC 
            LIMIT 6
        """)
        psicologia_por_mes = cur.fetchall()
        
        cur.execute("""
            SELECT DATE_FORMAT(fecha, '%Y-%m') as mes, 
                   COUNT(*) as total 
            FROM citas_enfermeria 
            GROUP BY mes 
            ORDER BY mes DESC 
            LIMIT 6
        """)
        enfermeria_por_mes = cur.fetchall()
        
        cur.close()
        
        return jsonify({
            "success": True,
            "total_psicologia": total_psicologia,
            "total_enfermeria": total_enfermeria,
            "psicologia_por_mes": [dict(zip(['mes', 'total'], row)) for row in psicologia_por_mes],
            "enfermeria_por_mes": [dict(zip(['mes', 'total'], row)) for row in enfermeria_por_mes]
        })
        
    except Exception as e:
        print(f"Error al obtener estadísticas: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500



# Ruta para la tabla del estudiante donde visualizara sus citas (DANIEL GARCIA)
# estudiante id = 1130267745
@app.route('/getAll_est', methods=['GET'])
def get_all_est():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT 'Psicologia' AS Tipo_Cita, id AS ID_de_Cita, sede, fecha, Nombre_Completo 
            FROM citas 
            WHERE Nombre_Completo = 'Daniel Garcia' 
            UNION ALL 
            SELECT 'Enfermeria' AS Tipo_Cita, id AS ID_de_Cita, sede, fecha, Nombre_Completo 
            FROM citas_enfermeria 
            WHERE Nombre_Completo = 'Daniel Garcia';
        """)
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            # Verifica el tipo de result[3] y maneja el formateo
            fecha = result[3]
            if isinstance(fecha, (datetime, date)):
                fecha_formateada = fecha.strftime('%Y-%m-%d')
            else:
                fecha_formateada = "No especificado"
            
            content = {
                'Tipo_Cita': result[0] or "No especificada",
                'ID_De_Cita': result[1],
                'sede': result[2] or "No especificada",
                'fecha': fecha_formateada,
                'Nombre_Completo': result[4] or "No especificado"
            }
            payload.append(content)
        
        print("Datos a enviar:", payload)
        return jsonify(payload)
    except Exception as e:
        print(f"Error en get_all_est: {str(e)}")
        return jsonify({"error": str(e)}), 500
    

# Ruta para la tabla del estudiante donde visualizara sus recomendaciones (DANIEL GARCIA)
# estudiante id = 1130267745
@app.route('/get_recommendations_est', methods=['GET'])
def get_recommendations_est():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT 'Psicologia' AS Tipo_Recomendacion, 
                   r.id AS ID_De_Recomendacion, 
                   r.recomendacion, 
                   r.fecha AS fecha_recomendacion, 
                   'Psicologo' AS Tipo_Profesional
            FROM recomendaciones_psicologia r
            WHERE r.id_estudiante = %s
            UNION ALL 
            SELECT 'Enfermeria' AS Tipo_Recomendacion, 
                   r.id_recomendacion AS ID_De_Recomendacion, 
                   r.recomendacion, 
                   r.fecha_recomendacion AS fecha_recomendacion, 
                   'Enfermero' AS Tipo_Profesional
            FROM recomendaciones_enfermeria r
            WHERE r.id_estudiante = %s;
        """, (1130267745, 1130267745))
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            fecha = result[3]
            if isinstance(fecha, (datetime, date)):
                fecha_formateada = fecha.strftime('%Y-%m-%d')
            else:
                fecha_formateada = "No especificado"
            
            content = {
                'Tipo_Recomendacion': result[0] or "No especificada",
                'ID_De_Recomendacion': result[1],
                'recomendacion': result[2] or "No especificada",
                'fecha': fecha_formateada,
                'Tipo_Profesional': result[4] or "No especificado"
            }
            payload.append(content)
        
        print("Datos a enviar:", payload)
        return jsonify(payload)
    except Exception as e:
        print(f"Error en get_recommendations_est: {str(e)}")
        return jsonify({"error": str(e)}), 500



# Ruta para la tabla del estudiante 2 donde visualizara sus citas (Vanesa Martinez)
@app.route('/getAll_estu', methods=['GET'])
def get_all_estu():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
                    SELECT 'Psicologia' AS Tipo_Cita, id AS ID_de_Cita, sede, fecha, Nombre_Completo 
                    FROM citas 
                    WHERE Nombre_Completo = 'Vanesa Martinez' 
                    UNION ALL 
                    SELECT 'Enfermeria' AS Tipo_Cita, id AS ID_de_Cita, sede, fecha, Nombre_Completo 
                    FROM citas_enfermeria 
                    WHERE Nombre_Completo = 'Vanesa Martinez';
        """)
        rv = cur.fetchall()
        cur.close()
        
        payload = []
        for result in rv:
            # Verifica el tipo de fecha y maneja el formato
            fecha = result[3]
            if fecha is None:
                fecha_formateada = "No especificado"
            elif isinstance(fecha, (datetime, date)):
                fecha_formateada = fecha.strftime('%Y-%m-%d')
            else:
                fecha_formateada = "No especificado"
            
            content = {
                'Tipo_Cita': result[0] or "No especificada",
                'ID_De_Cita': result[1],
                'sede': result[2] or "No especificada",
                'fecha': fecha_formateada,
                'Nombre_Completo': result[4] or "No especificado"
            }
            payload.append(content)
        
        print("Datos a enviar:", payload)
        return jsonify(payload)
    except Exception as e:
        print(f"Error en get_all_estu: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Ruta para la tabla del estudiante donde visualizara sus recomendaciones (Vanesa Martinez)
# estudiante id = 1140837811
@app.route('/get_recommendations_est1', methods=['GET'])
def get_recommendations_est1():
    try:
        estudiante_doc = 1140837811  # Nuevo documento del estudiante

        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT 'Psicologia' AS Tipo_Recomendacion, 
                   r.id AS ID_De_Recomendacion, 
                   r.recomendacion, 
                   r.fecha AS fecha_recomendacion, 
                   'Psicologo' AS Tipo_Profesional
            FROM recomendaciones_psicologia r
            WHERE r.id_estudiante = %s
            UNION ALL 
            SELECT 'Enfermeria' AS Tipo_Recomendacion, 
                   r.id_recomendacion AS ID_De_Recomendacion, 
                   r.recomendacion, 
                   r.fecha_recomendacion AS fecha_recomendacion, 
                   'Enfermero' AS Tipo_Profesional
            FROM recomendaciones_enfermeria r
            WHERE r.id_estudiante = %s;
        """, (estudiante_doc, estudiante_doc))
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            fecha = result[3]
            if isinstance(fecha, (datetime, date)):
                fecha_formateada = fecha.strftime('%Y-%m-%d')
            else:
                fecha_formateada = "No especificado"
            
            content = {
                'Tipo_Recomendacion': result[0] or "No especificada",
                'ID_De_Recomendacion': result[1],
                'recomendacion': result[2] or "No especificada",
                'fecha': fecha_formateada,
                'Tipo_Profesional': result[4] or "No especificado"
            }
            payload.append(content)
        
        print("Datos a enviar:", payload)
        return jsonify(payload)
    except Exception as e:
        print(f"Error en get_recommendations_est: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Ruta para consultar todos los registros (PSICOLOGO)
@app.route('/getAll_psi', methods=['GET'])
def get_all_psi():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT id, estudiante_id, Nombre_Completo, Correo, Genero, motivo, fecha, hora, sede
            FROM citas
            WHERE Nombre_Completo IS NOT NULL AND Nombre_Completo != ''
            ORDER BY fecha, hora
        """)
        rv = cur.fetchall()
        cur.close()
        
        payload = []
        for result in rv:
            # Verifica y maneja el formato de la fecha y hora
            fecha_reserva = "No especificado"
            if isinstance(result[6], (date, datetime)):
                fecha_reserva = result[6].strftime('%Y-%m-%d')
            elif isinstance(result[6], str):
                fecha_reserva = result[6]
                
            hora_reserva = "No especificado"
            if isinstance(result[7], timedelta):
                total_seconds = result[7].total_seconds()
                hours = int(total_seconds // 3600)
                minutes = int((total_seconds % 3600) // 60)
                hora_reserva = f"{hours:02}:{minutes:02}"
            elif isinstance(result[7], str):
                hora_reserva = result[7]
                
            content = {
                'id': result[0],  # Asegúrate de incluir el ID
                'user_id': result[1],
                'nombre_apellidos': result[2] or "No especificado",
                'correo': result[3] or "No especificado",
                'genero': result[4] or "No especificado",
                'motivo': result[5] or "No especificado",
                'fecha_reserva': fecha_reserva,
                'hora_reserva': hora_reserva,
                'sede': result[8] or "No especificado"
            }
            payload.append(content)
        return jsonify(payload)
    except Exception as e:
        print(f"Error en get_all_psi: {str(e)}")
        return jsonify({"error": str(e)}), 500

# Ruta para consultar todos los registros(ENFERMERIA)
@app.route('/getAll_enfer', methods=['GET'])
def get_all_enfer():
    try:
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT id, estudiante_id AS user_id, 
                   Nombre_Completo AS nombre_apellidos,
                   Correo AS correo,
                   Genero AS genero,
                   motivo,
                   fecha AS fecha_reserva,
                   hora AS hora_reserva,
                   sede
            FROM citas_enfermeria
            ORDER BY fecha, hora
        """)
        rv = cur.fetchall()
        column_names = [i[0] for i in cur.description]
        payload = [dict(zip(column_names, row)) for row in rv]
        cur.close()
        
        # Formatear fechas y horas
        for cita in payload:
            if isinstance(cita['fecha_reserva'], (date, datetime)):
                cita['fecha_reserva'] = cita['fecha_reserva'].strftime('%Y-%m-%d')
            if isinstance(cita['hora_reserva'], timedelta):
                total = cita['hora_reserva'].total_seconds()
                cita['hora_reserva'] = f"{int(total//3600):02}:{int((total%3600)//60):02}"
        
        return jsonify(payload)
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# Ruta para eliminar citas psicológicas
@app.route('/delete_enfer/<int:cita_id>', methods=['DELETE'])
@cross_origin()
def delete_enfer(cita_id):
    try:
        cur = mysql.connection.cursor()
        
        # Verificar existencia
        cur.execute("SELECT id FROM citas_enfermeria WHERE id = %s", (cita_id,))
        if not cur.fetchone():
            return jsonify({
                "success": False,
                "message": f"No existe cita con ID {cita_id}"
            }), 404
        
        # Eliminar
        cur.execute("DELETE FROM citas_enfermeria WHERE id = %s", (cita_id,))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": f"Cita {cita_id} eliminada",
            "deleted_id": cita_id
        })
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error al eliminar"
        }), 500
    finally:
        cur.close()


@app.route('/delete_psi/<int:cita_id>', methods=['DELETE'])
@cross_origin()
def delete_psi(cita_id):
    try:
        # Validación adicional del ID
        if not cita_id or cita_id <= 0:
            return jsonify({
                "success": False,
                "message": "ID de cita inválido"
            }), 400

        cur = mysql.connection.cursor()
        
        # Verificar existencia
        cur.execute("SELECT id FROM citas WHERE id = %s", (cita_id,))
        if not cur.fetchone():
            return jsonify({
                "success": False,
                "message": f"No existe cita con ID {cita_id}"
            }), 404
        
        # Eliminar
        cur.execute("DELETE FROM citas WHERE id = %s", (cita_id,))
        mysql.connection.commit()
        
        return jsonify({
            "success": True,
            "message": f"Cita {cita_id} eliminada",
            "deleted_id": cita_id
        })
        
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "Error al eliminar la cita"
        }), 500
    finally:
        if 'cur' in locals():
            cur.close()


#  consultar por parámetro
@cross_origin()
@app.route('/getAllById/<id>', methods=['GET'])
def getAllById(id):
    try:
        cur = mysql.connection.cursor()
        cur.execute('SELECT * FROM user WHERE id = %s', (id,))
        rv = cur.fetchall()
        cur.close()
        payload = []
        for result in rv:
            content = {
                'id': result[0], 
                'nombre': result[1], 
                'identificacion': result[2], 
                'correo': result[3], 
                'telefono': result[4], 
                'username': result[5], 
                'password': result[6], 
                'rol': result[7]
            }
            payload.append(content)
        return jsonify(payload)
    except Exception as e:
        print(e)
        return jsonify({"informacion": str(e)})

#  crear un registro
@cross_origin()
@app.route('/add_contact', methods=['POST'])
def add_contact():
    try:
        if request.method == 'POST':
            nombre = request.json['nombre']
            identificacion = request.json['identificacion']
            correo = request.json['correo']
            telefono = request.json['telefono']
            username = request.json['username']
            password = request.json['password']
            rol = request.json['rol']
            cur = mysql.connection.cursor()
            cur.execute("""
                INSERT INTO user (nombre, identificacion, correo, telefono, username, password, rol)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """, (nombre, identificacion, correo, telefono, username, password, rol))
            mysql.connection.commit()
            cur.close()
            return jsonify({"informacion": "Registro exitoso"})
    except Exception as e:
        print(e)
        return jsonify({"informacion": str(e)})

# actualizar un registro
@app.route('/update/<int:id>', methods=['PUT'])
@cross_origin()
def update_contact(id):
    try:
        data = request.get_json()
        nombre = data.get('nombre')
        identificacion = data.get('identificacion')
        correo = data.get('correo')
        telefono = data.get('telefono')
        username = data.get('username')
        password = data.get('password')
        rol = data.get('rol')

        # Validación básica de datos
        if not all([nombre, identificacion, correo, telefono, username, password, rol]):
            return jsonify({"informacion": "Todos los campos son requeridos"}), 400

        cur = mysql.connection.cursor()
        cur.execute("""
            UPDATE user
            SET nombre = %s,
                identificacion = %s,
                correo = %s,
                telefono = %s,
                username = %s,
                password = %s,
                rol = %s
            WHERE id = %s
        """, (nombre, identificacion, correo, telefono, username, password, rol, id))
        mysql.connection.commit()
        cur.close()
        
        return jsonify({"informacion": "Usuario actualizado correctamente"})
    
    except Exception as e:
        print(e)
        return jsonify({"informacion": "Error al actualizar el usuario", "error": str(e)}), 500

# eliminar un registro
@cross_origin()
@app.route('/delete/<int:id>', methods=['DELETE'])
def delete_contact(id):
    try:
        print(f"Intentando eliminar usuario con ID: {id}")
        cur = mysql.connection.cursor()
        cur.execute('DELETE FROM user WHERE id = %s', (id,))
        mysql.connection.commit()
        cur.close()
        print(f"Usuario con ID {id} eliminado correctamente")
        return jsonify({"informacion": "Usuario eliminado correctamente"})
    except Exception as e:
        print(f"Error al eliminar usuario con ID {id}: {e}")
        return jsonify({"informacion": "Error al eliminar usuario", "error": str(e)}), 500

# Ruta creada para la insersion de datos o agrgar datos a la tabla de citas
@cross_origin()
@app.route('/citas', methods=['POST'])
def citas():
    try:
        if request.method == 'POST':
            motivo = request.json.get('motivo')
            fecha_reserva = request.json.get('fecha')
            hora_reserva = request.json.get('hora')
            sede = request.json.get('sede')
            identificacion = request.json.get('identificacion')
            
            if not identificacion:
                return jsonify({"informacion": "Identificación no proporcionada"}), 400
            try:
                identificacion = int(identificacion)
            except ValueError:
                return jsonify({"informacion": "Identificación inválida"}), 400
            
            cur = mysql.connection.cursor()
            
            # Verificar valor de identificación
            print(f"Identificación recibida: {identificacion}")
            cur.execute("SELECT identificacion, Nombre_Completo, Correo, Genero FROM estudiante WHERE identificacion = %s", (identificacion,))
            estudiante = cur.fetchone()
            
            # Verificar resultado de la consulta
            print(f"Resultado de la consulta: {estudiante}")
            if not estudiante:
                cur.close()
                return jsonify({"informacion": "Estudiante no encontrado"}), 404
            
            # Verificar si ya existe una cita en la misma sede, fecha y hora
            cur.execute("""
                SELECT id FROM citas 
                WHERE fecha = %s AND hora = %s AND sede = %s
            """, (fecha_reserva, hora_reserva, sede))
            
            cita_existente = cur.fetchone()
            if cita_existente:
                cur.close()
                return jsonify({"informacion": "Ya existe una cita programada en esta sede, fecha y hora"}), 409
            
            id_estudiante, nombre, email, genero = estudiante
            cur.execute("""
                INSERT INTO citas (estudiante_id, motivo, fecha, hora, sede, Nombre_Completo, Correo, Genero)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (id_estudiante, motivo, fecha_reserva, hora_reserva, sede, nombre, email, genero))
            mysql.connection.commit()
            cur.close()
            return jsonify({"informacion": "Cita registrada exitosamente"})
    except Exception as e:
        print(e)
        return jsonify({"informacion": f"Error interno del servidor: {str(e)}"}), 500


# Ruta creada para la insersion de datos o agrgar datos a la tabla de citas enfermeria
@cross_origin()
@app.route('/disponibilidad', methods=['GET'])
def verificar_disponibilidad():
    try:
        fecha = request.args.get('fecha')
        sede = request.args.get('sede')
        
        if not fecha or not sede:
            return jsonify({"informacion": "Fecha y sede son requeridos"}), 400
        
        cur = mysql.connection.cursor()
        cur.execute("""
            SELECT hora FROM citas 
            WHERE fecha = %s AND sede = %s
        """, (fecha, sede))
        
        horas_ocupadas = [row[0] for row in cur.fetchall()]
        
        # También verificar citas de enfermería
        cur.execute("""
            SELECT hora FROM citas_enfermeria 
            WHERE fecha = %s AND sede = %s
        """, (fecha, sede))
        
        # Añadir las horas ocupadas de enfermería a la lista
        horas_ocupadas.extend([row[0] for row in cur.fetchall()])
        
        cur.close()
        
        # Definir todas las horas disponibles (ajusta según tus horarios)
        todas_horas = ['08:00', '09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00']
        horas_disponibles = [hora for hora in todas_horas if hora not in horas_ocupadas]
        
        return jsonify({"horas_disponibles": horas_disponibles})
    except Exception as e:
        print(e)
        return jsonify({"informacion": f"Error interno del servidor: {str(e)}"}), 500


@cross_origin()
@app.route('/citas_enfermeria', methods=['POST'])
def citas_enfermeria():
    try:
        if request.method == 'POST':
            motivo = request.json.get('motivo')
            fecha_reserva = request.json.get('fecha')
            hora_reserva = request.json.get('hora')
            sede = request.json.get('sede')
            identificacion = request.json.get('identificacion')
            
            if not identificacion:
                return jsonify({"informacion": "Identificación no proporcionada"}), 400
            try:
                identificacion = int(identificacion)
            except ValueError:
                return jsonify({"informacion": "Identificación inválida"}), 400
            
            cur = mysql.connection.cursor()
            
            # Verificar si el estudiante existe
            cur.execute("SELECT identificacion, Nombre_Completo, Correo, Genero FROM estudiante WHERE identificacion = %s", (identificacion,))
            estudiante = cur.fetchone()
            
            if not estudiante:
                cur.close()
                return jsonify({"informacion": "Estudiante no encontrado"}), 404
            
            # Verificar si ya existe una cita en la misma sede, fecha y hora (en ambas tablas)
            cur.execute("""
                SELECT id FROM citas_enfermeria 
                WHERE fecha = %s AND hora = %s AND sede = %s
            """, (fecha_reserva, hora_reserva, sede))
            
            cita_existente = cur.fetchone()
            if cita_existente:
                cur.close()
                return jsonify({"informacion": "Ya existe una cita de enfermería programada en esta sede, fecha y hora"}), 409
            
            # También verificar en la tabla de citas normales
            cur.execute("""
                SELECT id FROM citas 
                WHERE fecha = %s AND hora = %s AND sede = %s
            """, (fecha_reserva, hora_reserva, sede))
            
            cita_normal_existente = cur.fetchone()
            if cita_normal_existente:
                cur.close()
                return jsonify({"informacion": "Ya existe una cita normal programada en esta sede, fecha y hora"}), 409
            
            id_estudiante, nombre, email, genero = estudiante
            cur.execute("""
                INSERT INTO citas_enfermeria (estudiante_id, motivo, fecha, hora, sede, Nombre_Completo, Correo, Genero)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (id_estudiante, motivo, fecha_reserva, hora_reserva, sede, nombre, email, genero))
            mysql.connection.commit()
            cur.close()
            return jsonify({"informacion": "Cita de enfermería registrada exitosamente"})
    except Exception as e:
        print(e)
        return jsonify({"informacion": f"Error interno del servidor: {str(e)}"}), 500

# Ruta para la revision de recomendaciones del cuerpo de enfermeria 
@app.route('/registrar_recomendacion_ef', methods=['POST'])
def registrar_recomendacion_ef():
    try:
        data = request.get_json()
        id_enfermero = data.get('id_enfermero')
        id_estudiante = data.get('id_estudiante')
        fecha_recomendacion = data.get('fecha_recomendacion')
        recomendacion = data.get('recomendacion')

        # Validar que todos los datos requeridos estén presentes
        if not all([id_enfermero, id_estudiante, fecha_recomendacion, recomendacion]):
            return jsonify({'message': 'Faltan datos requeridos'}), 400

        # Validar tipos de datos
        if not (isinstance(id_enfermero, int) and isinstance(id_estudiante, int)):
            return jsonify({'message': 'ID de enfermero y estudiante deben ser números enteros'}), 400

        cur = mysql.connection.cursor()

        # Verificar si el enfermero existe
        check_enfermero_sql = "SELECT COUNT(*) FROM enfermero WHERE identificacion = %s"
        cur.execute(check_enfermero_sql, (id_enfermero,))
        if cur.fetchone()[0] == 0:
            cur.close()
            return jsonify({'message': 'El enfermero especificado no existe en la base de datos'}), 400

        # Verificar si el estudiante existe
        check_estudiante_sql = "SELECT COUNT(*) FROM estudiante WHERE identificacion = %s"
        cur.execute(check_estudiante_sql, (id_estudiante,))
        if cur.fetchone()[0] == 0:
            cur.close()
            return jsonify({'message': 'El estudiante especificado no existe en la base de datos'}), 400

        # Insertar la recomendación
        insert_sql = """
        INSERT INTO recomendaciones_enfermeria (id_enfermero, id_estudiante, fecha_recomendacion, recomendacion)
        VALUES (%s, %s, %s, %s)
        """
        values = (id_enfermero, id_estudiante, fecha_recomendacion, recomendacion)
        cur.execute(insert_sql, values)
        mysql.connection.commit()
        cur.close()
        
        return jsonify({'message': 'Recomendación registrada exitosamente'})
    except IntegrityError as e:
        mysql.connection.rollback()
        return jsonify({'message': f'Error de integridad de datos: {str(e)}'}), 400
    except Exception as err:
        mysql.connection.rollback()
        return jsonify({'message': f'Error inesperado: {str(err)}'}), 500
    

    
# Ruta para la revision de recomendaciones del cuerpo de psicologia
@app.route('/registrar_recomendacion_ps', methods=['POST'])
def registrar_recomendacion_ps():
    try:
        data = request.get_json()
        id_psicologo = data.get('id_psicologo')
        id_estudiante = data.get('id_estudiante')
        fecha_recomendacion = data.get('fecha_recomendacion')
        recomendacion = data.get('recomendacion')

        # Validar que todos los datos requeridos estén presentes
        if not all([id_psicologo, id_estudiante, fecha_recomendacion, recomendacion]):
            return jsonify({'message': 'Faltan datos requeridos'}), 400

        # Validar tipos de datos
        if not (isinstance(id_psicologo, int) and isinstance(id_estudiante, int)):
            return jsonify({'message': 'ID de psicólogo y estudiante deben ser números enteros'}), 400

        print(f"Datos recibidos - Psicólogo: {id_psicologo}, Estudiante: {id_estudiante}")

        cur = mysql.connection.cursor()

        # Verificar si el psicólogo existe
        check_psicologo_sql = "SELECT COUNT(*) FROM psicologo WHERE identificacion = %s"
        cur.execute(check_psicologo_sql, (id_psicologo,))
        psicologo_count = cur.fetchone()[0]
        print(f"Resultados de búsqueda de psicólogo: {psicologo_count}")
        if psicologo_count == 0:
            cur.close()
            return jsonify({'message': 'El psicólogo especificado no existe en la base de datos'}), 400

        # Verificar si el estudiante existe
        check_estudiante_sql = "SELECT COUNT(*) FROM estudiante WHERE identificacion = %s"
        cur.execute(check_estudiante_sql, (id_estudiante,))
        estudiante_count = cur.fetchone()[0]
        print(f"Resultados de búsqueda de estudiante: {estudiante_count}")
        if estudiante_count == 0:
            cur.close()
            return jsonify({'message': 'El estudiante especificado no existe en la base de datos'}), 400

        # Insertar la recomendación
        insert_sql = """
        INSERT INTO recomendaciones_psicologia (id_psicologo, id_estudiante, recomendacion, fecha)
        VALUES (%s, %s, %s, %s)
        """
        values = (id_psicologo, id_estudiante, recomendacion, fecha_recomendacion)

        # Debugging output
        print(f"SQL Query: {insert_sql}")
        print(f"Values: {values}")

        cur.execute(insert_sql, values)
        mysql.connection.commit()
        cur.close()

        return jsonify({'message': 'Recomendación registrada exitosamente'})
    except IntegrityError as e:
        mysql.connection.rollback()
        return jsonify({'message': f'Error de integridad de datos: {str(e)}'}), 400
    except Exception as err:
        mysql.connection.rollback()
        return jsonify({'message': f'Error inesperado: {str(err)}'}), 500


# Ruta para el login
@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return jsonify({'success': False, 'message': 'Nombre de usuario y contraseña son requeridos'}), 400
        
        cur = mysql.connection.cursor()
        query = 'SELECT username, password, role FROM usuarios WHERE username = %s AND password = %s'
        cur.execute(query, (username, password))
        user = cur.fetchone()
        cur.close()
        
        if user:
            # Crear un token de acceso
            access_token = create_access_token(identity={'username': username, 'role': user[2]})
            
            # Imprimir el token en la consola
            print(f'Token generado: {access_token}')
            
            return jsonify({
                'success': True,
                'access_token': access_token,
                'username': username,
                'role': user[2]
            })
        else:
            return jsonify({'success': False, 'message': 'Usuario o contraseña incorrectos'}), 401

    except Exception as e:
        print(f'Error en /login: {e}')
        return jsonify({'success': False, 'error': str(e)}), 500


# Rutas protegidas
@app.route('/admin')
@jwt_required()
def admin():
    return render_template('html/admin.html')

@app.route('/bienestar')
@jwt_required()
def bienestar():
    return render_template('html/bienestar.html')

@app.route('/enfermeria')
@jwt_required()
def enfermeria():
    current_user = get_jwt_identity()
    if current_user['role'] == 'enfermeria':
        return render_template('html/enfermeria.html')
    else:
        return redirect('/')  # Redirige a la página de inicio si no tiene el rol adecuado

@app.route('/estudiante')
@jwt_required()
def estudiantes():
    return render_template('html/estudiantes.html')

@app.route('/estudiante2')
@jwt_required()
def Estudiantes():
    return render_template('html/estudiantes2.html')

@app.route('/formed')
@jwt_required()
def formed():
    return render_template('html/FORMED.html')

@app.route('/formpsi')
@jwt_required()
def formpsi():
    return render_template('html/formpsi.html')

@app.route('/graficos')
@jwt_required()
def graficos():
    return render_template('html/Graficos.html')

@app.route('/psicologos')
@jwt_required()
def psicologos():
    return render_template('html/psicologos.html')


# starting the app
if __name__ == "__main__":
    app.run(port=3000, debug=True)
