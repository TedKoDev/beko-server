-- topic 테이블에 더미 데이터 삽입
-- category 테이블에 더미 데이터 삽입
-- sql문 그냥 넣고 돌리면 됨

INSERT INTO public."topic" (title, created_at, updated_at, deleted_at) VALUES
('Brewing Methods', NOW(), NULL, NULL),
('Coffee Beans', NOW(), NULL, NULL),
('Coffee Equipment', NOW(), NULL, NULL),
('Coffee Culture', NOW(), NULL, NULL),
('Coffee Recipes', NOW(), NULL, NULL);

INSERT INTO public."category" (topic_id, category_name, created_at, updated_at, deleted_at) VALUES
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'Espresso', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'French Press', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Brewing Methods'), 'Pour Over', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Beans'), 'Arabica', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Beans'), 'Robusta', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Equipment'), 'Grinders', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Equipment'), 'Espresso Machines', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Culture'), 'History', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Culture'), 'Trends', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Recipes'), 'Iced Coffee', NOW(), NULL, NULL),
((SELECT topic_id FROM public."topic" WHERE title = 'Coffee Recipes'), 'Coffee Cocktails', NOW(), NULL, NULL);

INSERT INTO levelthreshold (level, min_posts, min_comments, min_likes, min_logins, created_at)
VALUES
(1, 0, 0, 0, 1, '2024-08-12 02:48:27.472927'),
(2, 5, 10, 20, 5, '2024-08-12 02:48:27.472927'),
(3, 20, 40, 80, 10, '2024-08-12 02:48:27.472927'),
(4, 50, 100, 200, 20, '2024-08-12 02:48:27.472927'),
(5, 100, 200, 400, 30, '2024-08-12 02:48:27.472927'),
(6, 175, 350, 700, 40, '2024-08-12 02:48:27.472927'),
(7, 275, 550, 1100, 50, '2024-08-12 02:48:27.472927'),
(8, 400, 800, 1600, 60, '2024-08-12 02:48:27.472927'),
(9, 550, 1100, 2200, 70, '2024-08-12 02:48:27.472927'),
(10, 725, 1450, 2900, 80, '2024-08-12 02:48:27.472927'),
(11, 925, 1850, 3700, 90, '2024-08-12 02:48:27.472927'),
(12, 1150, 2300, 4600, 100, '2024-08-12 02:48:27.472927'),
(13, 1400, 2800, 5600, 110, '2024-08-12 02:48:27.472927'),
(14, 1700, 3400, 6800, 120, '2024-08-12 02:48:27.472927'),
(15, 2050, 4100, 8200, 130, '2024-08-12 02:48:27.472927'),
(16, 2450, 4900, 9800, 140, '2024-08-12 02:48:27.472927'),
(17, 2900, 5800, 11600, 150, '2024-08-12 02:48:27.472927'),
(18, 3400, 6800, 13600, 160, '2024-08-12 02:48:27.472927'),
(19, 3950, 7900, 15800, 170, '2024-08-12 02:48:27.472927'),
(20, 4550, 9100, 18200, 180, '2024-08-12 02:48:27.472927');
