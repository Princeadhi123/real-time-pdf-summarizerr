from flask import Flask, request, jsonify
from flask_cors import CORS
from transformers import BartTokenizer, BartForConditionalGeneration, T5Tokenizer, T5ForConditionalGeneration

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes

# Load BART model and tokenizer
bart_tokenizer = BartTokenizer.from_pretrained('facebook/bart-large-cnn')
bart_model = BartForConditionalGeneration.from_pretrained('facebook/bart-large-cnn')

# Load the T5 model and tokenizer
t5_tokenizer = T5Tokenizer.from_pretrained('t5-small')
t5_model = T5ForConditionalGeneration.from_pretrained('t5-small')

@app.route('/summarize/bart', methods=['POST'])
def summarize_bart():
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400

    text = request.json['text']
    inputs = bart_tokenizer([text], max_length=1024, return_tensors='pt', truncation=True)

    try:
        summary_ids = bart_model.generate(
            inputs['input_ids'],
            max_length=150,
            min_length=40,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True,
            do_sample=True,  # Enable sampling
            temperature=0.9,  # Allows for more creative summaries
            top_p=0.9         # Allows for more diverse responses
        )
        summary = bart_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': 'Failed to generate summary', 'details': str(e)}), 500

@app.route('/summarize/t5', methods=['POST'])
def summarize_t5():
    if not request.json or 'text' not in request.json:
        return jsonify({'error': 'No text provided'}), 400

    text = request.json['text']
    prompt = "summarize: " + text  # T5 requires a prompt prefix for summarization

    # Prepare the input for T5 model
    inputs = t5_tokenizer.encode(prompt, return_tensors="pt", max_length=512, truncation=True)

    try:
        summary_ids = t5_model.generate(
            inputs,
            max_length=150,
            min_length=40,
            length_penalty=2.0,
            num_beams=4,
            early_stopping=True,
            do_sample=True,
            temperature=0.9,
            top_p=0.9
        )
        summary = t5_tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        return jsonify({'summary': summary})
    except Exception as e:
        return jsonify({'error': 'Failed to generate summary', 'details': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
