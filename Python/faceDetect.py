# %%
# !pip install opencv-python imgbeddings psycopg2-binary

# %% [markdown]
# Step 1: Face recognition
# Detect the faces from the test-image picture and store them under the stored-faces folder

# %%
# importing the cv2 library
import cv2
import numpy as np
from imgbeddings import imgbeddings
from PIL import Image
import psycopg2
import os
from IPython.display import Image as i, display
from sanic import json
from scipy.spatial.distance import cosine


async def faceDetect(request):
# loading the haar case algorithm file into alg variable
    alg = "/Users/fung8/Desktop/Tecky/selfStudy/Python/haarcascade_frontalface_default.xml"
# passing the algorithm to OpenCV
    haar_cascade = cv2.CascadeClassifier(alg)
# loading the image path into file_name variable - replace <INSERT YOUR IMAGE NAME HERE> with the path to your image
# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/photos/blackpink.jpg"
# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/photos/USA.jpg"
    file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/photos/collar.jpg"


# reading the image
    img = cv2.imread(file_name, 0)
# creating a black and white version of the image
    gray_img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
# detecting the faces
    faces = haar_cascade.detectMultiScale(
        gray_img, scaleFactor=1.1, minNeighbors=10, minSize=(100, 100)
    )

    i = 0
# for each face detected
    for x, y, w, h in faces:
    # crop the image to select only the face
        cropped_image = img[y : y + h, x : x + w]
    # loading the target image path into target_file_name variable  - replace <INSERT YOUR TARGET IMAGE NAME HERE> with the path to your target image
        target_file_name = '/Users/fung8/Desktop/Tecky/selfStudy/Python/stored-faces/' + str(i) + '.jpg'
        cv2.imwrite(
           target_file_name,
          cropped_image,
        )
        i = i + 1;

# %% [markdown]
# Step 2: Embeddings Calculation
# Calculate embeddings from the faces and pushing to PostgreSQL, you'll need to change the <SERVICE_URI> parameter with the PostgreSQL Service URI

# %%
# importing the required libraries


# connecting to the database - replace the SERVICE URI with the service URI
    conn = psycopg2.connect(database="facialdetect",
                        host="localhost",
                        user="fung8",
                        password="postgres",
                        port="5432")

    cur = conn.cursor()

# Drop the pictures table if it exists
    cur.execute("DROP TABLE IF EXISTS pictures")

# Create a new pictures table
    cur.execute("CREATE TABLE pictures (picture text primary key, embedding vector(768))")
# cur.execute("CREATE TABLE pictures (picture text, embedding vector(768))")


    for filename in os.listdir("stored-faces"):
      if filename == ".DS_Store":
         continue
    # opening the image
    img = Image.open("stored-faces/" + filename)
    # loading the `imgbeddings`
    ibed = imgbeddings()
    # calculating the embeddings
    embedding = ibed.to_embeddings(img)
    cur.execute("INSERT INTO pictures values (%s,%s)", (filename, embedding[0].tolist()))
    print(filename)
    conn.commit()


# %% [markdown]
# Step 3: Calculate embeddings on a new picture
# Find the face and calculate the embeddings on the picture solo-image.png used for research

# %%
# loading the face image path into file_name variable
# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/Louis.jpg"  # replace <INSERT YOUR FACE FILE NAME> with the path to your image
    file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/ivy.jpg"  # Replace with your file path
# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/day.jpg"  # Replace with your file path

# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/day2.png"  # Replace with your file path
# file_name = "/Users/fung8/Desktop/Tecky/selfStudy/Python/soloface/cricket.png"  # Replace with your file path

# reading the image
    input_img = cv2.imread(file_name, 0)
# creating a black and white version of the image
    input_gray_img = cv2.cvtColor(input_img, cv2.COLOR_RGB2BGR)
# detecting the faces
    input_faces = haar_cascade.detectMultiScale(
    input_gray_img, scaleFactor=1.1, minNeighbors=10, minSize=(100, 100)
)


# %%
    i = 0
    embedding = ""
# for each face detected
    for x, y, w, h in input_faces:
    # crop the image to select only the face
        cropped_image = input_img[y : y + h, x : x + w]
    # loading the target image path into target_file_name variable  - replace <INSERT YOUR TARGET IMAGE NAME HERE> with the path to your target image
        target_file_name = '/Users/fung8/Desktop/Tecky/selfStudy/Python/test/' + str(i) + '.jpg'
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

# print(embedding)


# %% [markdown]
# Step 3: Find similar images by querying the Postgresql database using pgvector

# %%

    cur = conn.cursor()
    cur.execute("SELECT * FROM pictures;")
    rows = cur.fetchall()
    input_array = embedding[0]


    print(input_array.shape)
    score = 0
    target_index = ""
    final_match = ""
    for index, row in enumerate(rows):
        name = row[0]
        array = row[1]
        database_array = np.array(eval(array))
    # display(i(filename="/Users/fung8/Desktop/Tecky/selfStudy/Python/stored-faces/"+name))
    # Calculate the cosine similarity between the embeddings
        similarity = 1 - cosine(input_array, database_array)
        if score < similarity:
            score = similarity
            target_index = index
            final_match = name
    # Print the similarity score
    # print("Similarity:", similarity)
    # print("index: ", index)
    print("score: ", score)
    print("target_index: ", target_index)
    display(i(filename="/Users/fung8/Desktop/Tecky/selfStudy/Python/stored-faces/"+final_match))
    cur.close()


    response_data = {
        'score': score,
        'target_index': target_index,
        'final_match': final_match
    }
    
    return json(response_data)

