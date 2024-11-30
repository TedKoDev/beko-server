-- category 테이블에 더미 데이터 삽입

-- 1:1 문의 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '문법 상담', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '작문 첨삭', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '발음 교정', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '학습 상담', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '1:1 문의'), '기타 상담', NOW(), NULL, NULL);

-- 한국어 학습 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '문법', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '어휘', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '발음', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '쓰기', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국어 학습'), '말하기', NOW(), NULL, NULL);

-- 한국 문화 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), 'K-POP', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '영화/드라마', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '음식', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '전통문화', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '한국 문화'), '생활문화', NOW(), NULL, NULL);

-- 커뮤니티 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '자유게시판', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '친구찾기', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '스터디모집', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '한국생활정보', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '커뮤니티'), '경험공유', NOW(), NULL, NULL);

-- 학습 자료 카테고리
INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = '학습 자료'), '교재추천', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '학습 자료'), '학습앱소개', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '학습 자료'), '온라인강의', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '학습 자료'), '시험정보', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = '학습 자료'), '학습팁', NOW(), NULL, NULL);
