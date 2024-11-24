-- topic 테이블에 더미 데이터 삽입
INSERT INTO public."topic" (title, created_at, updated_at, deleted_at) VALUES
('1:1 문의', NOW(), NULL, NULL),
('한국어 학습', NOW(), NULL, NULL),
('한국 문화', NOW(), NULL, NULL),
('커뮤니티', NOW(), NULL, NULL),
('학습 자료', NOW(), NULL, NULL),
('질문과 답변', NOW(), NULL, NULL);
