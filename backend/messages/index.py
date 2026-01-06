import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: dict, context) -> dict:
    method = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    try:
        headers = event.get('headers', {})
        user_id = headers.get('X-User-Id') or headers.get('x-user-id')
        
        if not user_id:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Unauthorized'}),
                'isBase64Encoded': False
            }
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters') or {}
            chat_id = params.get('chat_id')
            
            if chat_id:
                cur.execute("""
                    SELECT m.id, m.message_text, m.message_type, m.media_url, m.duration,
                           m.created_at, m.sender_id, m.is_read,
                           u.first_name, u.last_name, u.username, u.avatar_url
                    FROM messages m
                    JOIN users u ON m.sender_id = u.id
                    WHERE m.chat_id = %s
                    ORDER BY m.created_at ASC
                """, (chat_id,))
                messages = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(msg) for msg in messages], default=str),
                    'isBase64Encoded': False
                }
            else:
                cur.execute("""
                    SELECT DISTINCT c.id, c.name, c.is_group, c.avatar_url,
                           (SELECT message_text FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                           (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time,
                           (SELECT COUNT(*) FROM messages WHERE chat_id = c.id AND sender_id != %s AND is_read = false) as unread_count
                    FROM chats c
                    JOIN chat_members cm ON c.id = cm.chat_id
                    WHERE cm.user_id = %s
                    ORDER BY last_message_time DESC NULLS LAST
                """, (user_id, user_id))
                chats = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(chat) for chat in chats], default=str),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body = json.loads(event.get('body', '{}'))
            action = body.get('action')
            
            if action == 'send':
                chat_id = body.get('chat_id')
                message_text = body.get('message_text', '').strip()
                message_type = body.get('message_type', 'text')
                media_url = body.get('media_url')
                duration = body.get('duration')
                
                if not chat_id:
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'chat_id is required'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute("""
                    INSERT INTO messages (chat_id, sender_id, message_text, message_type, media_url, duration)
                    VALUES (%s, %s, %s, %s, %s, %s)
                    RETURNING id, chat_id, sender_id, message_text, message_type, created_at
                """, (chat_id, user_id, message_text, message_type, media_url, duration))
                message = cur.fetchone()
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(message), default=str),
                    'isBase64Encoded': False
                }
            
            elif action == 'create_chat':
                name = body.get('name', '').strip()
                is_group = body.get('is_group', False)
                member_ids = body.get('member_ids', [])
                
                cur.execute("""
                    INSERT INTO chats (name, is_group, created_by)
                    VALUES (%s, %s, %s)
                    RETURNING id, name, is_group
                """, (name, is_group, user_id))
                chat = cur.fetchone()
                chat_id = chat['id']
                
                cur.execute("""
                    INSERT INTO chat_members (chat_id, user_id, role)
                    VALUES (%s, %s, 'admin')
                """, (chat_id, user_id))
                
                for member_id in member_ids:
                    if member_id != int(user_id):
                        cur.execute("""
                            INSERT INTO chat_members (chat_id, user_id)
                            VALUES (%s, %s)
                        """, (chat_id, member_id))
                
                conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(chat), default=str),
                    'isBase64Encoded': False
                }
            
            else:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Invalid action'}),
                    'isBase64Encoded': False
                }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Method not allowed'}),
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
