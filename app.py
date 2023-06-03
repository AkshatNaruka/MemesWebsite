from flask import Flask, render_template, jsonify
import requests

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/memes')
def get_memes():
    # Fetch memes from Reddit API
    url = 'https://api.reddit.com/r/memes/hot'
    headers = {'User-Agent': 'Mozilla/5.0'}
    response = requests.get(url, headers=headers)
    data = response.json()
    
    # Extract relevant information from the response
    memes = []
    for post in data['data']['children']:
        meme = {
            'title': post['data']['title'],
            'image': post['data']['url'],
            'score': post['data']['score']
        }
        memes.append(meme)
    
    return jsonify(memes)

if __name__ == '__main__':
    app.run()
