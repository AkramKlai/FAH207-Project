# Game: Snakes & Ladders but in the theme of Greek and Roman Art

Num. of Players: 2

Rules:
- Each player take turns rolling a 6-sided die
- If a player lands on a **action** space, they are prompted with a question about a given artwork (either MCQ or T/F questions)
    - Get it correct -> Move up 5 spaces
    - Get it wrong -> Move down 3 spaces
- The player who gets to the end first wins

Questions and Answers are found in text files, under "Game Info"
- Each Question is associated with a piece of artwork
- The format in the text files: [Q. Type] [Position] [Artwork] ...
    - **Q. Type**: either multiple choice (MCQ) or "True or False" (TF)
    - **Position**: the numbered position on the board (i.e. 20 = 20th square on board)
    - **Artwork**: the name of the specific artwork(s) (must match the name of the image under "Images\Artwork" and multiple artworks are divided by commas) --> Example: [Pompey, Augustus]
- Questions format: (only shows A and B for True/False questions)
[Question] 
A [Option]
B [Option]
C [Option]
D [Option]
- Answers format: 
[Answer] // A, B, C, D where A is True and B is False
[Additional Detail] // This is text meant to be shown after getting the right answer
- Each question is found on an **action** space (based on the given position)

Layout:
- Board Size: 6x6 = 36 spaces
- Start Square (on bottom right corner) and End Square (on top left corner)
- Both player pieces are in start square

