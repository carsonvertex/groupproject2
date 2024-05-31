from sanic import Sanic
from sanic.response import json
from faceDetect import faceDetect
import cv2
from imgbeddings import imgbeddings
from PIL import Image
import numpy as np
from scipy.spatial.distance import cosine
from IPython.display import Image as i, display
import psycopg2
from sanic.response import json, text
from sanic.exceptions import FileNotFound
import os
import base64
from sanic.response import json
from sanic_cors import CORS

# Create an instance of the Sanic app
project_directory = "/Users/fung8/Desktop/Tecky/groupproject2/Python/"
app = Sanic(__name__)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:8000"}})
alg = project_directory + "/haarcascade_frontalface_default.xml"
haar_cascade = cv2.CascadeClassifier(alg)
# file_name = project_directory + "/soloface/ivy.jpg"  # Replace with your file path

def getEmbedding(file_name):
    # file_name = project_directory + "/soloface/ivy.jpg"  # Replace with your file path

    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/day.jpg"  # Replace with your file path

    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/day2.png"  # Replace with your file path
    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/cricket.png"  # Replace with your file path
    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/pig.png"  # Replace with your file path


    # reading the image
    input_img = cv2.imread(file_name, 0)
    # creating a black and white version of the image
    input_gray_img = cv2.cvtColor(input_img, cv2.COLOR_RGB2BGR)
    # detecting the faces
    input_faces = haar_cascade.detectMultiScale(
        # input_gray_img, scaleFactor=1.05, minNeighbors=7, minSize=(100, 100)
        input_gray_img, scaleFactor=1.2, minNeighbors=4, minSize=(100, 100)
    )
    print(input_faces)

    i = 0
    embedding = ""
    # print(input_gray_img)

    # for each face detected
    for x, y, w, h in input_faces:
        # crop the image to select only the face
        cropped_image = input_img[y : y + h, x : x + w]
        # loading the target image path into target_file_name variable  - replace <INSERT YOUR TARGET IMAGE NAME HERE> with the path to your target image
        target_file_name = project_directory + 'test/' + str(i) + '.jpg'
        cv2.imwrite(
            target_file_name,
            cropped_image,
        )
        # display(i(filename=target_file_name))
        image = Image.open(target_file_name)
        ibed = imgbeddings()
        # calculating the embeddings
        embedding = ibed.to_embeddings(image)
        # image.show()
        i = i + 1;

    print(embedding)
    return embedding[0]



# Define a route and its handler for a GET API
@app.route('/api/ai', methods=['GET'])
async def get_data(request):
    conn = psycopg2.connect(database="gp2",
                        host="localhost",
                        user="fung8",
                        password="postgres",
                        port="5432")
    username = request.args.get('username')
    cur = conn.cursor()
    result = cur.execute("SELECT username, p1, p2, p3, p4, p5, p6 FROM users WHERE username = '%s'" % username)
    rows = cur.fetchall()
    # Replace with your file path of 6 profile images

    # reading the image
    # input_img = cv2.imread(rows, 0)

    # input_array = ivyso()

    score = 0
    target_index = ""
    final_match = ""
    for index, row in enumerate(rows):
        name = row[0]
        p1 = row[1]
        p2 = row[2]
        p3 = row[3]
        p4 = row[4]
        p5 = row[5]
        p6 = row[6]
 
        # array = np.array(p1, p2,p3,p4,p5,p6)
        # img1 = Image.open(project_directory + "../uploads/" + p1)
        # img2 = Image.open("../uploads/" + p2)
        # img3 = Image.open("../uploads/" + p3)
        # img4 = Image.open("../uploads/" + p4)
        # img5 = Image.open("../uploads/" + p5)
        # img6 = Image.open("../uploads/" + p6)

        # print(img1)
        e1 = getEmbedding(project_directory + "../uploads/" + p1)
        e2 = getEmbedding(project_directory + "../uploads/" + p2)
        e3 = getEmbedding(project_directory + "../uploads/" + p3)
        e4 = getEmbedding(project_directory + "../uploads/" + p4)
        e5 = getEmbedding(project_directory + "../uploads/" + p5)
        e6 = getEmbedding(project_directory + "../uploads/" + p6)
        # e1 = getEmbedding(project_directory + "/soloface/ivy.jpg")
        verify = getEmbedding(project_directory + "../soloImages/" + name + '.png')

        # print(e1)
        # print(e2)s
        # print(e3)
        # print(e4)
        # print(e5)
        # print(e6)
        # print(ivyso)
        rows = np.array([e1, e2, e3, e4, e5, e6])  # Fix: Enclose the embeddings in a list
        score = 0
        target_index = ""
        # final_match = ""

        for index, row in enumerate(rows):
            similarity = 1 - cosine(row, verify)
            if score < similarity:
                score = similarity
                target_index = index
                # final_match = name
            # Print the similarity score
            # print("Similarity:", similarity)
            # print("index: ", index)
        print("score: ", score)
        print("target_index: ", target_index)
        # display(i(filename=project_directory + "stored-faces/"+final_match))
    
    return json({"score": score, "target_index": target_index})

# Run the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)