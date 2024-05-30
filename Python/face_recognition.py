import cv2
import numpy as np
from imgbeddings import imgbeddings
from PIL import Image
import psycopg2
import os



def face_recognition_and_embeddings():
    # Step 1: Face recognition
    # Detect the faces from the test-image picture and store them under the stored-faces folder

    # Set the paths for the algorithm and image
    alg = "/Users/fung8/Desktop/Tecky/selfStudy/Python/haarcascade_frontalface_default.xml"
    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/photos/blackpink.jpg"
    file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/photos/USA.jpg"


    # Load the Haar cascade algorithm
    haar_cascade = cv2.CascadeClassifier(alg)

    # Read the image
    img = cv2.imread(file_name, 0)

    # Convert the image to black and white
    gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

    # Detect the faces
    faces = haar_cascade.detectMultiScale(gray_img, scaleFactor=1.05, minNeighbors=2, minSize=(100, 100))

    # Crop and save the detected faces
    i = 0
    for x, y, w, h in faces:
        cropped_image = img[y:y+h, x:x+w]
        target_file_name = '/Users/fung8/Desktop/Tecky/selfStudy/Python/stored-faces/' + str(i) + '.jpg'
        cv2.imwrite(target_file_name, cropped_image)
        i += 1

    # Step 2: Embeddings Calculation
    # Calculate embeddings from the faces and push to PostgreSQL

    # Connect to the PostgreSQL database
    conn = psycopg2.connect(database="facialdetect", host="localhost", user="fung8", password="postgres", port="5432")
    cur = conn.cursor()

    # Drop the pictures table if it exists
    cur.execute("DROP TABLE IF EXISTS pictures")

    # Create a new pictures table
    cur.execute("CREATE TABLE pictures (picture text primary key, embedding vector(768))")

    # Calculate embeddings for each face and insert into the database
    for filename in os.listdir("stored-faces"):
        img = Image.open("stored-faces/" + filename)
        ibed = imgbeddings()
        embedding = ibed.to_embeddings(img)
        cur.execute("INSERT INTO pictures values (%s,%s)", (filename, embedding[0].tolist()))
        print(filename)

    conn.commit()

    # Step 3: Calculate embeddings on a new picture
    # Find the face and calculate the embeddings on the picture solo-image.png used for research

    # file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/jisoo.jpg"  # Replace with your file path
    file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/trump.jpg"  # Replace with your file path

    img = Image.open(file_name)
    ibed = imgbeddings()
    embedding = ibed.to_embeddings(img)

    # Step 4: Find similar images by querying the PostgreSQL database using pgvector

    cur = conn.cursor()
    string_representation = "[" + ",".join(str(x) for x in embedding[0].tolist()) + "]"
    cur.execute("SELECT * FROM pictures ORDER BY embedding <-> %s LIMIT 1;", (string_representation,))
    rows = cur.fetchall()
    for row in rows:
        display(i(filename="/Users/fung8/Desktop/Tecky/selfStudy/Python/stored-faces/" + row[0]))
    cur.close()

    # Close the PostgreSQL connection
    conn.close()