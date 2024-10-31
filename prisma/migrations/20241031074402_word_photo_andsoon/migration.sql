-- CreateTable
CREATE TABLE "wordlist" (
    "word_id" SERIAL NOT NULL,
    "word" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "wordlist_pkey" PRIMARY KEY ("word_id")
);

-- CreateTable
CREATE TABLE "picturewordquestion" (
    "question_id" SERIAL NOT NULL,
    "image_url" VARCHAR(255) NOT NULL,
    "level" INTEGER NOT NULL,
    "answer" VARCHAR(100) NOT NULL,
    "option1" VARCHAR(100) NOT NULL,
    "option2" VARCHAR(100) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,

    CONSTRAINT "picturewordquestion_pkey" PRIMARY KEY ("question_id")
);

-- CreateTable
CREATE TABLE "youtubelink" (
    "link_id" SERIAL NOT NULL,
    "link" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP,
    "deleted_at" TIMESTAMP,

    CONSTRAINT "youtubelink_pkey" PRIMARY KEY ("link_id")
);
