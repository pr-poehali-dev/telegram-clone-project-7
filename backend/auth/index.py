import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
import hashlib
import secrets

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def generate_token():
    return secrets.token_urlsafe(32)

def hash_phone(phone: str) -> str:
    return hashlib.sha256(phone.encode()).hexdigest()

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    try:
        body = json.loads(event.get('body', '{}'))
        action = body.get('action')
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if action == 'register':
            phone = body.get('phone', '').strip()
            first_name = body.get('first_name', '').strip()
            last_name = body.get('last_name', '').strip()
            username = body.get('username', '').strip()
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                "SELECT id FROM users WHERE phone = %s",
                (phone,)
            )
            existing = cur.fetchone()
            
            if existing:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User already exists'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """INSERT INTO users (phone, first_name, last_name, username, online) 
                   VALUES (%s, %s, %s, %s, true) RETURNING id, phone, first_name, last_name, username""",
                (phone, first_name, last_name, username or None)
            )
            user = cur.fetchone()
            conn.commit()
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        elif action == 'login':
            phone = body.get('phone', '').strip()
            
            if not phone:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Phone is required'}),
                    'isBase64Encoded': False
                }
            
            cur.execute(
                """UPDATE users SET online = true, last_seen = CURRENT_TIMESTAMP 
                   WHERE phone = %s 
                   RETURNING id, phone, first_name, last_name, username, avatar_url, bio""",
                (phone,)
            )
            user = cur.fetchone()
            conn.commit()
            
            if not user:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'}),
                    'isBase64Encoded': False
                }
            
            token = generate_token()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'user': dict(user),
                    'token': token
                }),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Invalid action'}),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()
