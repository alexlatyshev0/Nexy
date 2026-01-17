-- Seed data for scenes
-- Run this after schema.sql to populate initial scenes

INSERT INTO scenes (image_url, description, participants, dimensions, tags, intensity, relevant_for) VALUES

-- Базовые сцены (интенсивность 1-2)
('/placeholder', 'Нежный поцелуй пары на закате. Романтическая обстановка, мягкий свет.',
 '[{"role": "equal", "gender": "female", "action": "kissing"}, {"role": "equal", "gender": "male", "action": "kissing"}]',
 ARRAY['romantic', 'tender', 'kissing'], ARRAY['romantic', 'sunset', 'gentle'], 1,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Массаж спины при свечах. Интимная атмосфера спальни.',
 '[{"role": "active", "gender": "male", "action": "massaging"}, {"role": "passive", "gender": "female", "action": "receiving"}]',
 ARRAY['massage', 'tender', 'sensual'], ARRAY['candles', 'bedroom', 'relaxing'], 1,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Страстный оральный секс. Женщина доставляет удовольствие партнёру.',
 '[{"role": "active", "gender": "female", "action": "giving oral"}, {"role": "passive", "gender": "male", "action": "receiving"}]',
 ARRAY['oral', 'giving', 'pleasure'], ARRAY['bedroom', 'intimate'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Куннилингус. Мужчина доставляет удовольствие партнёрше.',
 '[{"role": "active", "gender": "male", "action": "giving oral"}, {"role": "passive", "gender": "female", "action": "receiving"}]',
 ARRAY['oral', 'receiving', 'pleasure'], ARRAY['bedroom', 'intimate'], 2,
 '{"gender": "any", "interested_in": "any"}'),

-- Средние сцены (интенсивность 2-3)
('/placeholder', 'Женщина в шёлковой повязке на глазах, партнёр шепчет ей на ухо.',
 '[{"role": "dominant", "gender": "male", "action": "whispering, teasing"}, {"role": "submissive", "gender": "female", "action": "blindfolded, anticipating"}]',
 ARRAY['blindfold', 'anticipation', 'sensory', 'trust'], ARRAY['silk', 'bedroom', 'sensual'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Лёгкое связывание рук шёлковыми лентами. Доверие и близость.',
 '[{"role": "dominant", "gender": "male", "action": "tying"}, {"role": "submissive", "gender": "female", "action": "bound, trusting"}]',
 ARRAY['bondage', 'light', 'trust', 'submission'], ARRAY['silk', 'gentle', 'bedroom'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Dirty talk во время секса. Эротические слова и команды.',
 '[{"role": "dominant", "gender": "male", "action": "talking dirty"}, {"role": "submissive", "gender": "female", "action": "listening, responding"}]',
 ARRAY['dirty_talk', 'verbal', 'dominance'], ARRAY['verbal', 'commanding'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Ролевая игра: босс и секретарша в офисе.',
 '[{"role": "dominant", "gender": "male", "action": "playing boss"}, {"role": "submissive", "gender": "female", "action": "playing secretary"}]',
 ARRAY['roleplay', 'power_dynamic', 'fantasy'], ARRAY['office', 'costume', 'scenario'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Секс в полупубличном месте - примерочная магазина.',
 '[{"role": "equal", "gender": "male", "action": "having sex"}, {"role": "equal", "gender": "female", "action": "having sex"}]',
 ARRAY['exhibition', 'public', 'thrill', 'risk'], ARRAY['public', 'risky', 'exciting'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Женщина сверху контролирует темп и глубину.',
 '[{"role": "dominant", "gender": "female", "action": "riding, controlling"}, {"role": "submissive", "gender": "male", "action": "receiving, surrendering"}]',
 ARRAY['femdom', 'control', 'riding'], ARRAY['woman_on_top', 'control'], 2,
 '{"gender": "any", "interested_in": "any"}'),

-- Продвинутые сцены (интенсивность 3-4)
('/placeholder', 'Шлепки по ягодицам. Игривое наказание.',
 '[{"role": "dominant", "gender": "male", "action": "spanking"}, {"role": "submissive", "gender": "female", "action": "receiving spanks"}]',
 ARRAY['spanking', 'pain', 'discipline', 'submission'], ARRAY['impact', 'playful', 'punishment'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'BDSM сцена с ошейником и поводком.',
 '[{"role": "dominant", "gender": "male", "action": "leading"}, {"role": "submissive", "gender": "female", "action": "collared, following"}]',
 ARRAY['bdsm', 'collar', 'leash', 'submission', 'dominance'], ARRAY['collar', 'control', 'ownership'], 4,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Связывание верёвкой (шибари). Эстетика и контроль.',
 '[{"role": "dominant", "gender": "male", "action": "tying shibari"}, {"role": "submissive", "gender": "female", "action": "bound in rope"}]',
 ARRAY['bondage', 'shibari', 'rope', 'art'], ARRAY['rope', 'japanese', 'artistic'], 4,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Зажимы на сосках. Острые ощущения.',
 '[{"role": "dominant", "gender": "male", "action": "applying clamps"}, {"role": "submissive", "gender": "female", "action": "feeling pain, pleasure"}]',
 ARRAY['pain', 'nipples', 'clamps', 'sensation'], ARRAY['nipple_play', 'pain'], 4,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Властная женщина в латексе доминирует над мужчиной.',
 '[{"role": "dominant", "gender": "female", "action": "dominating"}, {"role": "submissive", "gender": "male", "action": "submitting, kneeling"}]',
 ARRAY['femdom', 'latex', 'dominance', 'worship'], ARRAY['latex', 'mistress', 'kneeling'], 4,
 '{"gender": "any", "interested_in": "any"}'),

-- Разные гендерные комбинации
('/placeholder', 'Две женщины в нежных объятиях и поцелуях.',
 '[{"role": "equal", "gender": "female", "action": "kissing"}, {"role": "equal", "gender": "female", "action": "kissing"}]',
 ARRAY['lesbian', 'tender', 'kissing'], ARRAY['ff', 'romantic'], 2,
 '{"gender": "any", "interested_in": "female"}'),

('/placeholder', 'MMF тройка. Женщина между двумя мужчинами.',
 '[{"role": "active", "gender": "male", "action": "participating"}, {"role": "passive", "gender": "female", "action": "receiving"}, {"role": "active", "gender": "male", "action": "participating"}]',
 ARRAY['threesome', 'mmf', 'group'], ARRAY['group', 'multiple_partners'], 4,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'FFM тройка. Мужчина с двумя женщинами.',
 '[{"role": "active", "gender": "female", "action": "participating"}, {"role": "passive", "gender": "male", "action": "receiving"}, {"role": "active", "gender": "female", "action": "participating"}]',
 ARRAY['threesome', 'ffm', 'group'], ARRAY['group', 'multiple_partners'], 4,
 '{"gender": "any", "interested_in": "any"}'),

-- Ещё базовые
('/placeholder', 'Страстный секс в душе. Вода и пар.',
 '[{"role": "equal", "gender": "male", "action": "having sex"}, {"role": "equal", "gender": "female", "action": "having sex"}]',
 ARRAY['shower', 'wet', 'passionate'], ARRAY['bathroom', 'water', 'steamy'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Медленный, чувственный секс при свечах.',
 '[{"role": "equal", "gender": "male", "action": "making love"}, {"role": "equal", "gender": "female", "action": "making love"}]',
 ARRAY['romantic', 'slow', 'sensual', 'tender'], ARRAY['candles', 'intimate', 'loving'], 1,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Стриптиз для партнёра в спальне.',
 '[{"role": "active", "gender": "female", "action": "stripping"}, {"role": "passive", "gender": "male", "action": "watching"}]',
 ARRAY['striptease', 'tease', 'visual', 'seduction'], ARRAY['lingerie', 'dance', 'tease'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Использование вибратора во время секса.',
 '[{"role": "active", "gender": "male", "action": "using toy"}, {"role": "passive", "gender": "female", "action": "receiving stimulation"}]',
 ARRAY['toys', 'vibrator', 'enhancement'], ARRAY['vibrator', 'combined_stimulation'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Секс с зеркалом - наблюдение за собой.',
 '[{"role": "equal", "gender": "male", "action": "watching reflection"}, {"role": "equal", "gender": "female", "action": "watching reflection"}]',
 ARRAY['mirror', 'voyeurism', 'visual'], ARRAY['mirror', 'watching', 'visual'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Утренний секс - ленивый и нежный.',
 '[{"role": "equal", "gender": "male", "action": "making love"}, {"role": "equal", "gender": "female", "action": "making love"}]',
 ARRAY['morning', 'lazy', 'tender', 'intimate'], ARRAY['morning', 'sleepy', 'gentle'], 1,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Оральный секс 69 - взаимное удовольствие.',
 '[{"role": "equal", "gender": "male", "action": "giving and receiving"}, {"role": "equal", "gender": "female", "action": "giving and receiving"}]',
 ARRAY['oral', 'sixty_nine', 'mutual', 'simultaneous'], ARRAY['69', 'mutual_pleasure'], 2,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Агрессивный, страстный секс у стены.',
 '[{"role": "dominant", "gender": "male", "action": "pinning, thrusting"}, {"role": "submissive", "gender": "female", "action": "pinned, receiving"}]',
 ARRAY['rough', 'passionate', 'wall', 'aggressive'], ARRAY['standing', 'wall', 'intense'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Съёмка интимного видео для личного архива.',
 '[{"role": "equal", "gender": "male", "action": "filming, participating"}, {"role": "equal", "gender": "female", "action": "being filmed, participating"}]',
 ARRAY['filming', 'video', 'exhibition_light'], ARRAY['camera', 'recording', 'memories'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Секс в машине на пустынной парковке.',
 '[{"role": "equal", "gender": "male", "action": "having sex"}, {"role": "equal", "gender": "female", "action": "having sex"}]',
 ARRAY['car', 'public', 'spontaneous', 'risky'], ARRAY['car', 'outdoor', 'spontaneous'], 3,
 '{"gender": "any", "interested_in": "any"}'),

('/placeholder', 'Лёгкое удушение (breath play) с доверием.',
 '[{"role": "dominant", "gender": "male", "action": "choking lightly"}, {"role": "submissive", "gender": "female", "action": "trusting, surrendering"}]',
 ARRAY['breath_play', 'choking', 'trust', 'edge'], ARRAY['choking', 'breath', 'intense'], 4,
 '{"gender": "any", "interested_in": "any"}');
