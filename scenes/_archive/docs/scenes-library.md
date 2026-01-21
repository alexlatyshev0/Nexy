# Библиотека сцен для Intimate Discovery

## Глобальные настройки стиля

Эти параметры добавляются КО ВСЕМ промптам автоматически:

```typescript
const STYLE_CONFIG = {
  // Добавлять в начало каждого промпта
  prefix: "masterpiece, best quality, highly detailed, professional photography, cinematic lighting, sensual atmosphere, intimate mood, soft shadows, ",
  
  // Добавлять в конец
  suffix: ", 8k uhd, high resolution, detailed skin texture, photorealistic",
  
  // Negative prompt (что исключать)
  negative: "ugly, deformed, noisy, blurry, low quality, bad anatomy, bad proportions, extra limbs, cloned face, disfigured, gross proportions, malformed limbs, missing arms, missing legs, extra arms, extra legs, fused fingers, too many fingers, long neck, username, watermark, signature, text, cartoon, anime, illustration, child, underage, minor"
};
```

---

## Сцены

### Формат каждой сцены:

```typescript
interface Scene {
  id: string;
  generation_prompt: string;      // Для Civitai (БЕЗ стиля - добавится автоматически)
  ai_description: string;         // Для AI генерации вопросов
  participants: Participant[];
  dimensions: string[];           // Какие измерения профиля затрагивает
  tags: string[];
  intensity: number;              // 1-5
  relevant_for: {
    gender: 'male' | 'female' | 'any';
    interested_in: 'male' | 'female' | 'both' | 'any';
  };
}
```

---

## РАЗДЕЛ 1: Романтика и нежность (сцены 001-012)

### scene_001
```json
{
  "id": "scene_001",
  "generation_prompt": "heterosexual couple lying in bed facing each other on white cotton sheets, man on his left side propped on elbow, his right hand gently stroking through woman's loose hair spread on pillow, woman lying on her back head turned toward him, eyes closed with soft smile on lips, both bare shoulders visible above sheets suggesting nudity underneath, warm morning golden light streaming through sheer white curtains behind them, faces 15cm apart, his expression loving and attentive watching her face, wooden headboard visible, intimate bedroom atmosphere",
  "ai_description": "Утреннее пробуждение. Мужчина нежно гладит волосы женщины, лежащей рядом. Она улыбается с закрытыми глазами. Мягкий утренний свет, белые простыни. Атмосфера нежности и близости.",
  "participants": [
    { "role": "active", "gender": "male", "action": "нежно гладит волосы" },
    { "role": "receiving", "gender": "female", "action": "наслаждается прикосновением" }
  ],
  "dimensions": ["tenderness", "intimacy", "morning_sex", "gentle_touch"],
  "tags": ["morning", "gentle", "romantic", "bed", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_002
```json
{
  "id": "scene_002",
  "generation_prompt": "heterosexual couple lying in bed on white cotton sheets, woman on her side propped on left elbow facing him, her right hand with fingers gently tracing patterns on his bare muscular chest, man lying on his back head turned toward her, looking at her with loving expression soft smile, both nude under sheets covering from waist down, warm morning sunlight through sheer curtains casting soft glow, her hair falling over shoulder, his right arm relaxed at side, intimate peaceful bedroom with wooden furniture",
  "ai_description": "Утреннее пробуждение. Женщина нежно водит пальцами по груди мужчины. Он смотрит на неё с любовью. Мягкий утренний свет, белые простыни. Атмосфера нежности.",
  "participants": [
    { "role": "active", "gender": "female", "action": "нежно касается" },
    { "role": "receiving", "gender": "male", "action": "наслаждается прикосновением" }
  ],
  "dimensions": ["tenderness", "intimacy", "morning_sex", "gentle_touch"],
  "tags": ["morning", "gentle", "romantic", "bed", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_003
```json
{
  "id": "scene_003",
  "generation_prompt": "couple slow dancing in living room with dim warm evening lamp light, woman in elegant black dress resting her head on man's right shoulder eyes closed, her arms around his neck hands clasped behind, man in white dress shirt sleeves rolled up, both his hands resting on her lower back pulling her close, their bodies pressed together swaying gently, hardwood floor visible, soft ambient lighting from floor lamp, romantic atmosphere implied soft music, both barefoot intimate connection",
  "ai_description": "Пара медленно танцует в гостиной вечером. Её голова на его плече, его руки на её талии. Приглушённый свет, атмосфера романтики и близости без слов.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "обнимает, ведёт в танце" },
    { "role": "equal", "gender": "female", "action": "прижимается, следует" }
  ],
  "dimensions": ["romance", "intimacy", "connection", "slow_pace"],
  "tags": ["dancing", "romantic", "evening", "embrace", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_004
```json
{
  "id": "scene_004",
  "generation_prompt": "couple in large white freestanding bathtub together, woman sitting between his legs leaning back against his bare chest, her head resting on his shoulder eyes closed relaxed, his arms wrapped around her torso hands resting on her stomach underwater, both nude visible shoulders and her knees above bubble foam, multiple white pillar candles on wooden bath tray and floor around tub, warm amber lighting, visible steam rising, her wet hair slicked back, his chin resting near her temple, serene expressions",
  "ai_description": "Пара в ванне со свечами. Она откинулась на его грудь, его руки обнимают её. Пена, тёплый свет, пар. Расслабленная интимная атмосфера.",
  "participants": [
    { "role": "protective", "gender": "male", "action": "обнимает сзади" },
    { "role": "relaxed", "gender": "female", "action": "расслабляется в объятиях" }
  ],
  "dimensions": ["intimacy", "relaxation", "bath", "closeness", "trust"],
  "tags": ["bath", "candles", "romantic", "relaxation", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_005
```json
{
  "id": "scene_005",
  "generation_prompt": "couple in large white freestanding bathtub, man sitting between her legs leaning back against her chest, his head resting against her shoulder eyes closed completely relaxed, woman behind him with her arms wrapped around his broad shoulders hands on his chest, both nude visible from shoulders up and his knees above foam, white pillar candles surrounding tub on floor, warm golden lighting, steam rising, she looks down at him with nurturing caring expression, role reversal intimate moment",
  "ai_description": "Пара в ванне со свечами. Он откинулся на её грудь, её руки обнимают его. Она в заботливой роли. Пена, тёплый свет. Расслабленная интимная атмосфера.",
  "participants": [
    { "role": "nurturing", "gender": "female", "action": "обнимает сзади, заботится" },
    { "role": "relaxed", "gender": "male", "action": "расслабляется в объятиях" }
  ],
  "dimensions": ["intimacy", "relaxation", "bath", "role_reversal", "trust", "nurturing"],
  "tags": ["bath", "candles", "romantic", "role_reversal", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_006
```json
{
  "id": "scene_006",
  "generation_prompt": "couple kissing passionately against white wall, woman's back pressed flat against wall, man standing close facing her, both his hands cupping her face thumbs on her cheekbones, her hands flat on his chest gripping his shirt fabric, she wearing fitted burgundy dress, he in dark jeans and grey henley shirt, her right knee slightly raised, heads tilted into deep kiss mouths pressed together, dramatic side lighting casting shadows, intense romantic moment both eyes closed",
  "ai_description": "Страстный поцелуй у стены. Она прижата к стене, он держит её лицо в ладонях. Её руки на его груди. Оба одеты. Интенсивный романтический момент.",
  "participants": [
    { "role": "active", "gender": "male", "action": "целует, прижимает к стене" },
    { "role": "receptive", "gender": "female", "action": "отвечает на поцелуй" }
  ],
  "dimensions": ["passion", "kissing", "intensity", "desire", "against_wall"],
  "tags": ["kissing", "passionate", "wall", "clothed", "couple"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_007
```json
{
  "id": "scene_007",
  "generation_prompt": "couple kissing passionately against wall, man's back pressed against white wall, woman pressing into him assertively, both her hands holding his face palms on his jaw, his hands on her waist gripping fabric of her black dress, she on tiptoes leaning up into kiss, he in white shirt and dark pants, her body pressed against his pinning him, heads tilted deep kiss, dramatic lighting from side, she clearly initiates and leads the kiss",
  "ai_description": "Страстный поцелуй у стены. Он прижат к стене, она держит его лицо. Она инициирует, он отвечает. Оба одеты. Она ведёт.",
  "participants": [
    { "role": "active", "gender": "female", "action": "целует, прижимает к стене" },
    { "role": "receptive", "gender": "male", "action": "отвечает на поцелуй" }
  ],
  "dimensions": ["passion", "kissing", "female_initiative", "desire", "against_wall"],
  "tags": ["kissing", "passionate", "wall", "female_dominant", "couple"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_008
```json
{
  "id": "scene_008",
  "generation_prompt": "woman lying face down on bed with burgundy satin sheets, completely nude, arms folded under her head face turned to side eyes closed in relaxation, massage oil glistening on entire back from shoulders to lower back dimples visible above buttocks covered by sheet, man kneeling straddling her upper thighs wearing only dark boxer briefs, his torso bare showing defined muscles, both his strong hands pressing into her shoulder blades thumbs working trapezius muscles fingers spread wide on her oiled skin, multiple white pillar candles on bedside tables casting warm flickering light, massage oil bottle on nightstand",
  "ai_description": "Он делает ей чувственный массаж спины. Она лежит на животе, масло блестит на коже. Его сильные руки на её плечах. Свечи, интимная атмосфера спальни.",
  "participants": [
    { "role": "giving", "gender": "male", "action": "делает массаж" },
    { "role": "receiving", "gender": "female", "action": "получает массаж, расслабляется" }
  ],
  "dimensions": ["massage", "touch", "relaxation", "sensual", "caring"],
  "tags": ["massage", "oil", "candles", "bedroom", "couple"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_009
```json
{
  "id": "scene_009",
  "generation_prompt": "man lying face down on bed with white sheets, completely nude, arms at sides face turned to side eyes closed relaxed expression, massage oil glistening on his muscular back from shoulders to lower back, woman sitting straddling his lower back wearing black lace bralette and matching panties, leaning forward both hands pressing firmly into his shoulder muscles, her fingers digging into tense trapezius, her hair falling forward over her shoulder, white candles on nightstand warm amber glow, intimate caring atmosphere she takes care of him",
  "ai_description": "Она делает ему чувственный массаж спины. Он лежит на животе, масло на коже. Её руки разминают его мышцы. Свечи, интимная атмосфера. Она заботится о нём.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "делает массаж" },
    { "role": "receiving", "gender": "male", "action": "получает массаж, расслабляется" }
  ],
  "dimensions": ["massage", "touch", "relaxation", "sensual", "female_caring"],
  "tags": ["massage", "oil", "candles", "bedroom", "role_reversal"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_010
```json
{
  "id": "scene_010",
  "generation_prompt": "couple cuddling on grey fabric sectional couch under soft cream knit blanket, woman curled up against him with her head on his chest, her left hand resting on his stomach, her legs tucked under blanket, man sitting back with his right arm wrapped around her shoulders hand resting on her upper arm, his left hand holding TV remote on armrest, both wearing comfortable loungewear t-shirts, blue TV glow illuminating dark living room, cozy intimate evening peaceful expressions",
  "ai_description": "Пара обнимается на диване под пледом. Её голова на его груди, его рука вокруг неё. Свет от телевизора в темноте. Уютный вечер вместе.",
  "participants": [
    { "role": "protective", "gender": "male", "action": "обнимает" },
    { "role": "cozy", "gender": "female", "action": "прижимается" }
  ],
  "dimensions": ["cuddling", "comfort", "intimacy", "closeness", "cozy"],
  "tags": ["couch", "cuddling", "evening", "cozy", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_011
```json
{
  "id": "scene_011",
  "generation_prompt": "couple standing close forehead pressed to forehead, both eyes closed serene expressions, noses almost touching breathing same air, both hands intertwined fingers laced together held between their chests, she in cream silk slip dress thin straps, he in white linen shirt unbuttoned at collar, soft warm backlight creating gentle glow around them, minimal background focus on their connection, emotional intimacy visible in peaceful faces",
  "ai_description": "Пара лоб ко лбу, глаза закрыты. Интимный момент связи без слов. Руки переплетены. Мягкий свет. Эмоциональная близость.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "соединяется" },
    { "role": "equal", "gender": "female", "action": "соединяется" }
  ],
  "dimensions": ["emotional_connection", "intimacy", "presence", "love"],
  "tags": ["connection", "emotional", "intimate", "tender", "couple"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_012
```json
{
  "id": "scene_012",
  "generation_prompt": "man standing behind woman kissing her neck on left side just below ear, his lips pressed to her skin, woman's head tilted right eyes closed expression of pleasure slight smile, his arms wrapped around her waist from behind hands flat on her stomach, she wearing silk robe loosely tied falling off right shoulder, he shirtless chest pressed to her back, standing in bedroom with soft lamp light, her right hand reaching back touching his hip, sensual anticipation atmosphere",
  "ai_description": "Он целует её шею сзади. Её глаза закрыты от удовольствия, его руки на её талии. Стоят в спальне. Чувственное предвкушение.",
  "participants": [
    { "role": "active", "gender": "male", "action": "целует шею" },
    { "role": "receiving", "gender": "female", "action": "наслаждается" }
  ],
  "dimensions": ["neck_kissing", "anticipation", "sensual", "foreplay"],
  "tags": ["neck", "kissing", "behind", "sensual", "couple"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 2: Страсть и интенсивность (сцены 013-024)

### scene_013
```json
{
  "id": "scene_013",
  "generation_prompt": "man standing pressing woman against white bedroom wall holding her up, both his hands gripping firmly under her thighs supporting her weight, she wraps both legs tightly around his waist ankles crossed behind his lower back, her arms around his neck fingers gripping his shoulders, her back flat against wall, both faces close intense eye contact mouths slightly open breathing heavily, he wearing only unbuttoned jeans low on hips showing v-line, she in black lace bra straps falling off shoulders and matching panties pushed aside, dramatic side lighting casting shadows on wall, raw desire visible in expressions",
  "ai_description": "Страстный момент. Она обвила ногами его талию, он держит её у стены. Интенсивный зрительный контакт. Оба тяжело дышат. Сырое желание.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "держит, прижимает к стене" },
    { "role": "wrapped", "gender": "female", "action": "обвивает ногами" }
  ],
  "dimensions": ["passion", "intensity", "strength", "desire", "wall_sex"],
  "tags": ["wall", "passionate", "intense", "legs_wrapped", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_014
```json
{
  "id": "scene_014",
  "generation_prompt": "woman straddling man on bed with white sheets, she sitting upright on his hips thighs spread around his waist, leaning forward both her hands pinning his wrists firmly above his head against pillow, her arms straight pressing down, looking down at him with intense desire and control in her expression, he lying on back looking up at her submissively allowing her control, she completely nude breasts visible leaning over him, he nude visible chest and arms, dramatic bedroom lighting from side, she clearly dominant in control",
  "ai_description": "Она сверху, оседлала его на кровати. Прижимает его запястья над головой. Смотрит сверху с желанием. Она контролирует ситуацию.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "сверху, удерживает запястья" },
    { "role": "submissive", "gender": "male", "action": "позволяет контролировать" }
  ],
  "dimensions": ["female_dominance", "pinning", "control", "passion", "woman_on_top"],
  "tags": ["woman_on_top", "pinning", "dominant_female", "bed", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_015
```json
{
  "id": "scene_015",
  "generation_prompt": "man on top of woman on bed with dark sheets, he hovering over her supporting weight on knees straddling her hips, both his hands gripping her wrists pinning them firmly above her head against pillow, looking down at her with dominant intensity, she lying on back arching her back lifting chest toward him, her legs bent at knees spread around his hips, both nude, his muscular shoulders and arms tense, her expression mix of surrender and desire, intense eye contact between them, moody bedroom lighting",
  "ai_description": "Он сверху, прижимает её запястья над головой. Интенсивный зрительный контакт. Она выгибает спину. Страстный момент.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "сверху, удерживает запястья" },
    { "role": "submissive", "gender": "female", "action": "позволяет контролировать, выгибается" }
  ],
  "dimensions": ["dominance", "pinning", "control", "passion", "man_on_top"],
  "tags": ["pinning", "dominant_male", "bed", "intense", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_016
```json
{
  "id": "scene_016",
  "generation_prompt": "couple standing in apartment hallway urgently undressing each other, woman pulling man's white dress shirt open buttons popping off flying in air, he simultaneously unzipping back of her black cocktail dress pulling it down her shoulders, her bra visible underneath, his chest exposed shirt hanging open, both mouths open breathing heavily looking at each other with urgent need, her high heels still on his belt already undone, hallway with closed door behind them visible, dramatic lighting, they cannot wait to reach bedroom",
  "ai_description": "Пара срывает друг с друга одежду. Пуговицы летят. Срочная страстная потребность. Стоят в коридоре, не могут дойти до спальни.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "срывает одежду" },
    { "role": "equal", "gender": "female", "action": "срывает одежду" }
  ],
  "dimensions": ["urgency", "passion", "desire", "spontaneous", "can't_wait"],
  "tags": ["clothes_off", "urgent", "passionate", "hallway", "spontaneous"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_017
```json
{
  "id": "scene_017",
  "generation_prompt": "woman standing at foot of bed after pushing man onto it, he landed sitting on edge of bed leaning back on his elbows looking up at her with anticipation, she standing between his knees reaching behind her back unzipping her red cocktail dress letting it fall from shoulders, confident seductive expression looking down at him, black lace lingerie visible as dress slides down, he still fully dressed in suit pants and open collar shirt, she clearly in charge controlling the pace, bedroom with soft warm lighting",
  "ai_description": "Она толкает его на кровать. Стоит над ним, снимает платье. Уверенное соблазнительное выражение. Он смотрит с предвкушением. Она командует.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "толкает на кровать, раздевается" },
    { "role": "passive", "gender": "male", "action": "наблюдает, ждёт" }
  ],
  "dimensions": ["female_dominance", "striptease", "confidence", "seduction", "control"],
  "tags": ["push", "undressing", "confident_woman", "bed", "seduction"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_018
```json
{
  "id": "scene_018",
  "generation_prompt": "woman lying back on bed propped on elbows after being gently pushed down, still in black cocktail dress riding up her thighs, looking up at him biting her lower lip in anticipation, man standing at foot of bed between her legs, loosening his dark tie with one hand pulling knot down, other hand unbuttoning top button of white dress shirt, confident dominant expression looking down at her, still in full suit jacket and dress pants, he clearly takes charge, bedroom with moody lighting",
  "ai_description": "Он нежно но уверенно толкает её на кровать. Стоит над ней, ослабляя галстук. Уверенный взгляд. Она кусает губу в предвкушении. Он берёт инициативу.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "толкает на кровать, раздевается" },
    { "role": "receptive", "gender": "female", "action": "наблюдает, предвкушает" }
  ],
  "dimensions": ["dominance", "anticipation", "confidence", "taking_charge"],
  "tags": ["push", "tie", "confident_man", "bed", "anticipation"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_019
```json
{
  "id": "scene_019",
  "generation_prompt": "woman sitting on marble kitchen counter legs spread with man standing between them, her sitting on edge buttocks on cold stone counter, both hands gripping counter edge behind her for support, his hands on her bare thighs pushing her short skirt up, their foreheads pressed together passionate kiss mouths open, she wearing unbuttoned white blouse open showing black bra, her heels still on dangling, he in dark pants belt undone shirt untucked, modern apartment kitchen with stainless steel appliances behind them, spontaneous passionate moment",
  "ai_description": "Пара занимается любовью на кухонном столе. Она сидит на столешнице, он стоит между её ног. Страстный поцелуй. Спонтанное место.",
  "participants": [
    { "role": "active", "gender": "male", "action": "стоит между ног" },
    { "role": "seated", "gender": "female", "action": "сидит на столешнице" }
  ],
  "dimensions": ["spontaneous", "kitchen_sex", "passion", "unusual_place"],
  "tags": ["kitchen", "counter", "spontaneous", "passionate", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_020
```json
{
  "id": "scene_020",
  "generation_prompt": "man's bare muscular back filling frame with woman's hands visible on his shoulder blades, her fingernails digging into his skin dragging down leaving visible red scratch marks and welts, multiple parallel scratch lines from previous passes, his face visible in profile grimacing expression mixing pleasure and pain eyes squeezed shut, they in missionary position her beneath him visible arms wrapped around reaching his back, white bed sheets tangled around them, intimate bedroom lighting, intense passionate moment",
  "ai_description": "Она царапает его спину в страсти. Красные следы видны. Он морщится от смеси удовольствия и боли. Интенсивный интимный момент.",
  "participants": [
    { "role": "active", "gender": "female", "action": "царапает спину" },
    { "role": "receiving", "gender": "male", "action": "получает, наслаждается болью" }
  ],
  "dimensions": ["scratching", "passion", "pain_pleasure", "intensity", "marks"],
  "tags": ["scratching", "marks", "passionate", "pain", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_021
```json
{
  "id": "scene_021",
  "generation_prompt": "man standing behind woman, his right hand gripping handful of her long dark hair at base of skull pulling firmly but not violently, her head tilted back toward him from the pull exposing her throat, her eyes closed mouth open in pleasure expression, left hand reaching back gripping his thigh, she in matching nude lace bra and panties, he shirtless in dark jeans pressed against her from behind, standing in bedroom, his left hand on her bare hip, passionate possessive moment",
  "ai_description": "Его рука в её волосах сзади, не грубо но страстно. Её голова запрокинута от удовольствия. Стоя. Интенсивное желание.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "держит за волосы" },
    { "role": "receiving", "gender": "female", "action": "запрокидывает голову" }
  ],
  "dimensions": ["hair_pulling", "passion", "dominance", "pleasure"],
  "tags": ["hair", "pulling", "passionate", "dominant", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_022
```json
{
  "id": "scene_022",
  "generation_prompt": "woman standing behind kneeling man, her right hand gripping his short hair at top of head pulling his head back firmly, his face tilted up toward ceiling neck exposed, his eyes closed expression of submission and pleasure, she standing tall looking down at him with dominant controlling expression, her left hand on his bare shoulder, he kneeling on hardwood floor completely nude hands resting on his thighs, she wearing black leather bra and panties thigh-high boots, dramatic lighting from side, clear female dominance role reversal",
  "ai_description": "Её рука в его волосах, тянет его голову назад. Она стоит позади, он на коленях. Страстная интенсивность. Она контролирует.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "держит за волосы, контролирует" },
    { "role": "submissive", "gender": "male", "action": "на коленях, подчиняется" }
  ],
  "dimensions": ["hair_pulling", "female_dominance", "kneeling", "control", "role_reversal"],
  "tags": ["hair", "pulling", "femdom", "kneeling", "control"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_023
```json
{
  "id": "scene_023",
  "generation_prompt": "couple in glass-enclosed shower with white subway tile walls, water streaming down from rainfall showerhead, man's back pressed against tile wall, woman pressing her body against his front, both completely nude with wet glistening skin, her arms around his neck, his hands on her lower back pulling her close, their faces close foreheads touching, steam rising around them fogging glass door, water droplets on their shoulders and hair plastered wet, passionate embrace under hot water",
  "ai_description": "Пара в душе, вода стекает по телам. Страстные объятия. Пар. Его спина к стене, она прижимается к нему. Мокрые тела.",
  "participants": [
    { "role": "pressing", "gender": "female", "action": "прижимается" },
    { "role": "against_wall", "gender": "male", "action": "прижат к стене" }
  ],
  "dimensions": ["shower_sex", "wet", "passion", "steam", "spontaneous"],
  "tags": ["shower", "water", "wet", "passionate", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_024
```json
{
  "id": "scene_024",
  "generation_prompt": "couple in shower with grey tile walls, woman's back pressed against cold tile wall, man pressing his body against her front pinning her to wall, both completely nude wet bodies glistening, her arms around his shoulders nails digging into his back, one leg lifted wrapping around his hip, his hands under her thighs supporting her slightly lifted position, water from showerhead running down his back, steam filling shower, her head tilted back against tile eyes closed in pleasure, intense passionate moment",
  "ai_description": "Пара в душе. Пар. Её спина к стене, он прижимается к ней. Вода течёт. Интенсивный момент.",
  "participants": [
    { "role": "pressing", "gender": "male", "action": "прижимает" },
    { "role": "against_wall", "gender": "female", "action": "прижата к стене" }
  ],
  "dimensions": ["shower_sex", "wet", "passion", "against_wall"],
  "tags": ["shower", "water", "wall", "passionate", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 3: Оральные удовольствия (сцены 025-032)

### scene_025
```json
{
  "id": "scene_025",
  "generation_prompt": "woman kneeling on plush bedroom carpet between man's legs, sitting back on her heels knees apart, looking up at him with anticipation in her eyes and slight parted lips, both hands resting palms-up on her thighs in submissive gesture, she wearing black lace lingerie bra and panties, he standing before her in unbuttoned dark dress pants no shirt, soft warm lamp lighting from bedside, his hand reaching down to touch her chin tilting her face up, intimate submissive moment",
  "ai_description": "Она на коленях перед ним, смотрит снизу вверх. Интимный момент в спальне. Мягкий свет. Подчинённая позиция. Предвкушение в её глазах.",
  "participants": [
    { "role": "receiving", "gender": "male", "action": "стоит" },
    { "role": "giving", "gender": "female", "action": "на коленях, смотрит вверх" }
  ],
  "dimensions": ["oral_giving", "kneeling", "submission", "anticipation", "blowjob"],
  "tags": ["kneeling", "oral", "submissive", "bedroom", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_026
```json
{
  "id": "scene_026",
  "generation_prompt": "man kneeling on hardwood floor at woman's feet, sitting back on heels knees together, looking up at her with devoted expression, his hands clasped behind his back, completely nude, she standing tall over him in black lace bodysuit and high heels, one hand on her hip, other hand extended fingers under his chin tilting his face up, her expression confident and commanding, bedroom with dark decor, dramatic lighting from above, clear female power dynamic worship position",
  "ai_description": "Он на коленях перед ней. Она стоит уверенно. Он смотрит вверх с преданностью. Позиция поклонения. Она во власти.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "стоит уверенно" },
    { "role": "giving", "gender": "male", "action": "на коленях, смотрит вверх" }
  ],
  "dimensions": ["oral_giving", "kneeling", "worship", "female_power", "cunnilingus"],
  "tags": ["kneeling", "oral", "worship", "femdom", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_027
```json
{
  "id": "scene_027",
  "generation_prompt": "woman lying on back on white bed sheets, head on pillow eyes closed in pleasure mouth slightly open, her legs spread wide bent at knees feet flat on mattress, man lying on stomach between her thighs his face buried at her center performing cunnilingus, her left hand gripping the sheets her right hand in his hair fingers tangled pressing his head closer, her back slightly arched chest rising, she completely nude, visible from above angle, soft bedroom lamp lighting, expression of building pleasure",
  "ai_description": "Она лежит на кровати, глаза закрыты от удовольствия. Его голова между её бёдер. Её рука в его волосах. Выражение наслаждения.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "лежит, наслаждается" },
    { "role": "giving", "gender": "male", "action": "между её бёдер" }
  ],
  "dimensions": ["cunnilingus", "receiving_oral", "pleasure", "surrender"],
  "tags": ["oral", "cunnilingus", "pleasure", "bed", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_028
```json
{
  "id": "scene_028",
  "generation_prompt": "man lying on back on dark sheets, head on pillow eyes closed in pleasure expression jaw clenched, his hands gripping sheets at his sides, legs slightly spread, woman positioned between his legs on her stomach, her head at his lap giving oral pleasure head bobbing implied, both her hands flat on his inner thighs fingers spread pressing down, her hair falling forward obscuring face, he completely nude muscular body visible, she in matching burgundy bra visible from behind, intimate bedroom warm lighting",
  "ai_description": "Он лежит на кровати, глаза закрыты от удовольствия. Она между его ног, её руки на его бёдрах. Она доставляет удовольствие.",
  "participants": [
    { "role": "receiving", "gender": "male", "action": "лежит, наслаждается" },
    { "role": "giving", "gender": "female", "action": "между его ног" }
  ],
  "dimensions": ["blowjob", "receiving_oral", "pleasure", "giving"],
  "tags": ["oral", "blowjob", "pleasure", "bed", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_029
```json
{
  "id": "scene_029",
  "generation_prompt": "couple in 69 position on white bed sheets, woman on top facing his feet straddling his face, her knees either side of his head, leaning forward torso lowered to reach him, man lying on back beneath her his face between her thighs hands gripping her hips, both completely nude, her hands on his thighs for support, both giving and receiving oral simultaneously, sensual soft lighting from side, bodies intertwined mutual pleasure visible in body tension",
  "ai_description": "Поза 69 на кровати. Взаимное удовольствие. Интимная связь. Оба дают и получают одновременно.",
  "participants": [
    { "role": "both", "gender": "male", "action": "даёт и получает" },
    { "role": "both", "gender": "female", "action": "даёт и получает" }
  ],
  "dimensions": ["69", "mutual_oral", "simultaneous", "equality"],
  "tags": ["69", "mutual", "oral", "bed", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_030
```json
{
  "id": "scene_030",
  "generation_prompt": "woman sitting on man's face straddling his head, her knees on either side of his ears on white pillows, she leaning forward both hands gripping wooden headboard for balance and leverage, her back arched head tilted back eyes closed in pleasure, she completely nude body glistening with light sweat, he lying on back beneath her only his hands visible gripping her thighs, her hips grinding subtly taking her pleasure from him, dominant female position, bedroom with dramatic lighting",
  "ai_description": "Она сидит на его лице. Наклонилась вперёд, руки на изголовье кровати. Доминирующая позиция. Он под ней. Она берёт своё удовольствие.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "сидит на лице" },
    { "role": "submissive", "gender": "male", "action": "под ней, обслуживает" }
  ],
  "dimensions": ["face_sitting", "female_dominance", "taking_pleasure", "control"],
  "tags": ["facesitting", "femdom", "dominant_woman", "bed", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_031
```json
{
  "id": "scene_031",
  "generation_prompt": "man standing in bedroom, right hand gently placed on back of woman's head fingers in her hair, not pushing but guiding, she kneeling before him sitting back on heels, her face at his waist level looking up at him, her hands resting on his thighs, he wearing unbuttoned jeans pushed down, she in matching nude bra and panties, soft warm lamp lighting, his expression looking down at her with tenderness and desire, connection visible between them, gentle dominant guidance",
  "ai_description": "Он стоит, рука мягко на затылке. Она на коленях. Направление, не принуждение. Интимная связь.",
  "participants": [
    { "role": "guiding", "gender": "male", "action": "направляет" },
    { "role": "giving", "gender": "female", "action": "на коленях, следует" }
  ],
  "dimensions": ["oral_guidance", "gentle_dominance", "blowjob", "connection"],
  "tags": ["oral", "guidance", "kneeling", "gentle", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_032
```json
{
  "id": "scene_032",
  "generation_prompt": "woman standing confidently in bedroom, her right hand gripping man's hair at back of head guiding his face toward her, left hand on her own hip, she wearing black garter belt stockings and heels no panties, confident dominant expression looking down at him, man kneeling before her face at her waist level, his hands on her outer thighs, he completely nude, looking up at her with devoted worshipping expression, dramatic lighting from side highlighting her confident stance",
  "ai_description": "Она стоит, рука в его волосах. Он на коленях перед ней. Она направляет его голову. Уверенное выражение. Он поклоняется ей.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "направляет, контролирует" },
    { "role": "worshipping", "gender": "male", "action": "на коленях, поклоняется" }
  ],
  "dimensions": ["oral_guidance", "female_dominance", "worship", "cunnilingus", "control"],
  "tags": ["oral", "femdom", "worship", "guidance", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 4: BDSM — Bondage и ограничение (сцены 033-044)

### scene_033
```json
{
  "id": "scene_033",
  "generation_prompt": "woman lying on back on white satin sheets, both wrists tied together with burgundy silk scarf looped through ornate wooden headboard slats above her head, arms stretched up but not strained, she wearing matching cream lace bra and panties, her body relaxed but face showing anticipation parted lips looking toward camera, legs slightly apart bent at knees, soft warm lighting casting gentle shadows, elegant sensual restraint not harsh, intimate bedroom atmosphere",
  "ai_description": "Её запястья связаны шёлковым шарфом к изголовью. Она лежит на кровати. Мягкий бондаж. Предвкушение на лице. Элегантное ограничение, чувственное не жёсткое.",
  "participants": [
    { "role": "bound", "gender": "female", "action": "связана, ожидает" }
  ],
  "dimensions": ["bondage", "silk", "anticipation", "soft_restraint", "vulnerability"],
  "tags": ["bondage", "silk", "tied", "bed", "soft"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_034
```json
{
  "id": "scene_034",
  "generation_prompt": "man lying on back on dark grey sheets, both wrists tied together with black silk scarf secured to metal headboard above his head, arms stretched up muscles visible in biceps, completely nude, his body toned and exposed vulnerable, face showing mix of anticipation and trust looking up, legs slightly spread relaxed, soft moody lighting from side, elegant restraint sensual atmosphere, trusting vulnerable expression",
  "ai_description": "Его запястья связаны шёлковым шарфом к изголовью. Он лежит на кровати. Мягкий бондаж. Предвкушение. Уязвимое но доверяющее выражение.",
  "participants": [
    { "role": "bound", "gender": "male", "action": "связан, ожидает" }
  ],
  "dimensions": ["bondage", "silk", "anticipation", "male_vulnerability", "trust"],
  "tags": ["bondage", "silk", "tied", "bed", "male_sub"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_035
```json
{
  "id": "scene_035",
  "generation_prompt": "woman standing in artistic shibari rope bondage, red jute rope creating intricate diamond pattern across her bare torso from shoulders to hips, horizontal chest harness rope above and below breasts creating frame, her arms bound behind back wrists to elbows, she standing straight with dignified posture, completely nude except for rope, beautiful geometric pattern pressed into her skin, dark studio background with single spotlight from above, artistic aesthetic restraint expression serene",
  "ai_description": "Женщина в верёвочном бондаже. Художественное шибари. Замысловатые узлы по телу. Она стоит. Красивый узор на коже. Эстетическое ограничение.",
  "participants": [
    { "role": "bound", "gender": "female", "action": "в шибари" }
  ],
  "dimensions": ["shibari", "rope_bondage", "aesthetic", "art", "restraint"],
  "tags": ["shibari", "rope", "artistic", "bondage", "standing"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_036
```json
{
  "id": "scene_036",
  "generation_prompt": "man kneeling in shibari rope bondage, black jute rope chest harness crossing his muscular torso in geometric pattern, rope over shoulders crossing at sternum wrapping around ribs, his arms bound behind back, kneeling on dark hardwood floor sitting back on heels, completely nude, head bowed slightly in submission but body showing strength in muscle definition, dramatic side lighting highlighting rope patterns pressed into skin, artistic aesthetic vulnerable strength",
  "ai_description": "Мужчина в верёвочном бондаже. Шибари на груди. Замысловатые узлы. Он на коленях. Уязвимая сила. Художественное ограничение.",
  "participants": [
    { "role": "bound", "gender": "male", "action": "в шибари, на коленях" }
  ],
  "dimensions": ["shibari", "rope_bondage", "male_submission", "aesthetic", "kneeling"],
  "tags": ["shibari", "rope", "male_sub", "kneeling", "artistic"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_037
```json
{
  "id": "scene_037",
  "generation_prompt": "man standing close to woman fastening black leather padded cuffs around her wrists in front of her body, his fingers working the buckle on right cuff her left already secured, she watching his hands with expression of trust and visible excitement parted lips slight flush, she wearing black lace bra and panties, he shirtless in dark jeans, bedroom setting with bed visible behind them, intimate BDSM preparation moment, soft warm lighting",
  "ai_description": "Он связывает её запястья вместе перед ней. Она смотрит с доверием и возбуждением. Кожаные наручники. Спальня. Интимный BDSM момент.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "связывает" },
    { "role": "submissive", "gender": "female", "action": "позволяет связать" }
  ],
  "dimensions": ["bondage", "cuffs", "trust", "restraint", "preparation"],
  "tags": ["tying", "cuffs", "leather", "bedroom", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_038
```json
{
  "id": "scene_038",
  "generation_prompt": "woman fastening black leather cuffs around man's wrists held together in front of him, she focused on buckling the restraint her fingers deftly working leather strap, she wearing black corset and thong with thigh-high stockings, he completely nude watching her hands with trust and visible arousal, she confident controlled expression slight smile, he standing still allowing her to work, bedroom with dark decor, dramatic lighting, clear female dominance role reversal",
  "ai_description": "Она связывает его запястья. Кожаные наручники. Она контролирует. Он смотрит с доверием и возбуждением. BDSM с обратными ролями.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "связывает" },
    { "role": "submissive", "gender": "male", "action": "позволяет связать" }
  ],
  "dimensions": ["bondage", "cuffs", "female_dominance", "trust", "role_reversal"],
  "tags": ["tying", "cuffs", "femdom", "role_reversal", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_039
```json
{
  "id": "scene_039",
  "generation_prompt": "woman lying on back on white sheets, black silk blindfold tied over her eyes covering from eyebrows to cheekbones, both arms stretched above her head hands near headboard not tied but placed there, lips slightly parted in anticipation of unknown touch, she wearing cream silk slip short and thin-strapped, body tense with anticipation goosebumps visible on arms, legs slightly apart, soft diffused lighting creating intimate vulnerable atmosphere, sensory deprivation heightened awareness",
  "ai_description": "Она с завязанными глазами шёлком. Лежит на кровати, руки над головой. Ожидает прикосновения. Сенсорная депривация. Уязвимость.",
  "participants": [
    { "role": "blindfolded", "gender": "female", "action": "ожидает в неведении" }
  ],
  "dimensions": ["blindfold", "anticipation", "sensory_deprivation", "vulnerability", "trust"],
  "tags": ["blindfold", "silk", "bed", "anticipation", "sensory"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_040
```json
{
  "id": "scene_040",
  "generation_prompt": "man lying on back on dark sheets, black satin blindfold covering his eyes, both wrists tied separately to metal headboard bars with black rope arms spread in Y position, completely nude body exposed and vulnerable, muscles tense with anticipation, head slightly turned as if trying to hear approaching touch, lips parted breathing visible, trusting expression despite vulnerability, moody dramatic lighting from side, sensory deprivation creating heightened awareness",
  "ai_description": "Он с завязанными глазами. Лежит на кровати, руки привязаны к изголовью. Ожидает прикосновения. Уязвим. Доверяет.",
  "participants": [
    { "role": "blindfolded", "gender": "male", "action": "связан и ослеплён, ожидает" }
  ],
  "dimensions": ["blindfold", "bondage", "male_vulnerability", "trust", "sensory_deprivation"],
  "tags": ["blindfold", "tied", "bed", "male_sub", "vulnerable"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_041
```json
{
  "id": "scene_041",
  "generation_prompt": "woman kneeling at man's feet on bedroom carpet, wearing black leather collar with silver O-ring at front around her throat, sitting back on heels hands palms-down on her thighs, looking up at him with submissive yet proud dignified expression, she completely nude except for collar, he standing over her wearing dark dress pants and white shirt unbuttoned, his hand extended with two fingers under her chin tilting her face up, ownership dynamic visible in their eye contact, warm intimate lighting",
  "ai_description": "Она в ошейнике, на коленях у его ног. Смотрит на него снизу вверх. Подчинённая но гордая. Кожаный ошейник. Динамика принадлежности.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "владеет" },
    { "role": "submissive", "gender": "female", "action": "в ошейнике, на коленях" }
  ],
  "dimensions": ["collar", "ownership", "kneeling", "submission", "devotion"],
  "tags": ["collar", "kneeling", "submission", "leather", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_042
```json
{
  "id": "scene_042",
  "generation_prompt": "man kneeling at woman's feet on hardwood floor, wearing thick black leather collar with silver ring at throat, sitting on heels hands clasped behind his back, looking up at her with devoted adoring expression, he completely nude muscular body in submissive posture, she standing tall over him in black leather corset garter belt and stiletto heels, her hand resting on top of his head possessively, confident commanding expression looking down at her property, dramatic lighting female ownership dynamic",
  "ai_description": "Он в ошейнике, на коленях у её ног. Смотрит на неё снизу вверх. Преданный. Она стоит над ним уверенно. Женское владение.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "владеет" },
    { "role": "submissive", "gender": "male", "action": "в ошейнике, на коленях" }
  ],
  "dimensions": ["collar", "female_ownership", "kneeling", "male_submission", "devotion"],
  "tags": ["collar", "kneeling", "femdom", "leather", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_043
```json
{
  "id": "scene_043",
  "generation_prompt": "woman on all fours on bedroom floor on soft rug, wearing black leather collar with silver leash chain attached to O-ring, her back arched in feline pose head lifted looking forward, completely nude, man standing beside her holding leather loop end of leash in his right hand keeping light tension, he wearing dark pants and open shirt, looking down at her with dominant possessive expression, pet play dynamic clear in their positions, warm intimate bedroom lighting power exchange visible",
  "ai_description": "Она на четвереньках, ошейник и поводок. Он держит поводок. Динамика пет-плей. Интимная спальня. Обмен властью.",
  "participants": [
    { "role": "handler", "gender": "male", "action": "держит поводок" },
    { "role": "pet", "gender": "female", "action": "на четвереньках, на поводке" }
  ],
  "dimensions": ["pet_play", "leash", "collar", "submission", "power_exchange"],
  "tags": ["leash", "collar", "pet_play", "all_fours", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_044
```json
{
  "id": "scene_044",
  "generation_prompt": "man on all fours on hardwood floor, wearing black leather collar with chain leash attached, head lowered in submission, completely nude muscular body in submissive pet position, woman standing beside him holding leash wrapped around her hand once keeping firm tension pulling his head up slightly, she wearing black leather bra panties and thigh-high boots with heels, her posture tall commanding looking down at him, her free hand on her hip, role reversal pet play dominant female energy, dramatic lighting",
  "ai_description": "Он на четвереньках, ошейник и поводок. Она держит поводок стоя. Пет-плей. Обратные роли. Она командует.",
  "participants": [
    { "role": "handler", "gender": "female", "action": "держит поводок" },
    { "role": "pet", "gender": "male", "action": "на четвереньках, на поводке" }
  ],
  "dimensions": ["pet_play", "leash", "female_dominance", "male_submission", "role_reversal"],
  "tags": ["leash", "collar", "femdom", "pet_play", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 5: Impact play и боль (сцены 045-054)

### scene_045
```json
{
  "id": "scene_045",
  "generation_prompt": "woman bent over man's lap in over-the-knee position, her torso draped over his thighs as he sits on edge of bed, her hands braced on floor for support, his left hand on her lower back holding her in place, his right hand raised mid-swing about to connect with her bare buttocks pink from previous strikes, she wearing only matching lace bra panties pulled down to thighs, he in dark pants and shirt sleeves rolled up, her face turned toward camera showing mix of surprise and pleasure with parted lips, bedroom with soft lighting",
  "ai_description": "Его рука в момент шлепка по её попе. Она перегнулась через его колено. Игривая порка. Спальня. Её лицо показывает смесь удивления и удовольствия.",
  "participants": [
    { "role": "spanking", "gender": "male", "action": "шлепает" },
    { "role": "spanked", "gender": "female", "action": "через колено, получает" }
  ],
  "dimensions": ["spanking", "over_the_knee", "playful", "impact", "discipline"],
  "tags": ["spanking", "otk", "playful", "bottom", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_046
```json
{
  "id": "scene_046",
  "generation_prompt": "man bent over woman's lap in over-the-knee position, his torso draped across her thighs as she sits on armless chair, his hands gripping chair legs for support, he completely nude, his buttocks exposed showing pink marks from strikes, she wearing black corset and skirt hiked up, her left hand pressing on his upper back her right hand raised having just delivered spank, she smiling with satisfaction looking down at him, her expression playful yet dominant, bedroom with dark decor dramatic lighting",
  "ai_description": "Она шлепает его, он перегнулся через её колено. Обратные роли. Её рука на его попе. Игривое наказание. Она улыбается.",
  "participants": [
    { "role": "spanking", "gender": "female", "action": "шлепает" },
    { "role": "spanked", "gender": "male", "action": "через колено, получает" }
  ],
  "dimensions": ["spanking", "female_dominance", "role_reversal", "discipline", "playful"],
  "tags": ["spanking", "otk", "femdom", "role_reversal", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_047
```json
{
  "id": "scene_047",
  "generation_prompt": "woman bent forward at waist over edge of bed, her torso flat on mattress, both hands gripping white sheets tightly knuckles white with anticipation, her face turned to side eyes wide looking back, she completely nude buttocks raised and exposed, man standing behind her right side holding black leather paddle with holes in his right hand raised at shoulder height ready to swing, he wearing only dark pants bare chest, BDSM bedroom with dim moody lighting, her expression anticipating impact",
  "ai_description": "Она нагнулась у края кровати. Он держит кожаную падл. Предвкушение. Её руки вцепились в простыни. BDSM спальня. Сейчас получит удар.",
  "participants": [
    { "role": "dominant", "gender": "male", "action": "держит падл" },
    { "role": "receiving", "gender": "female", "action": "нагнулась, ожидает" }
  ],
  "dimensions": ["paddle", "impact_play", "anticipation", "discipline", "bdsm"],
  "tags": ["paddle", "bent_over", "anticipation", "bdsm", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_048
```json
{
  "id": "scene_048",
  "generation_prompt": "man bent forward over edge of bed, his torso on dark sheets, hands gripping mattress, face turned showing tense anticipation expression, he completely nude muscular buttocks exposed and raised, woman standing behind him wearing black leather corset garter belt stockings and heels, holding leather riding crop in right hand tapping it against her left palm menacingly, her posture dominant confident expression with slight smirk, looking at his exposed form deciding where to strike, dramatic side lighting female dominance",
  "ai_description": "Он нагнулся у края кровати. Она держит стек, постукивает им по ладони. Он ждёт. Женское доминирование. Предвкушение.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "держит стек" },
    { "role": "receiving", "gender": "male", "action": "нагнулся, ожидает" }
  ],
  "dimensions": ["crop", "female_dominance", "anticipation", "impact_play", "discipline"],
  "tags": ["crop", "bent_over", "femdom", "anticipation", "couple"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_049
```json
{
  "id": "scene_049",
  "generation_prompt": "woman lying face down on white sheets, her body relaxed in post-spanking aftercare, visible red marks and pink handprints on both buttocks showing recent impact play, her arms folded under head face turned to side with peaceful satisfied expression, man's hand gently resting on her lower back comfortingly, she completely nude skin slightly flushed, soft warm lighting creating intimate atmosphere, tender aftercare moment vulnerability and care visible",
  "ai_description": "Красные следы на её попе после порки. Она лежит лицом вниз. Момент aftercare. Нежность. Следы видны. Интимно.",
  "participants": [
    { "role": "marked", "gender": "female", "action": "лежит после порки" }
  ],
  "dimensions": ["aftercare", "marks", "spanking_result", "tenderness", "visible_marks"],
  "tags": ["marks", "aftercare", "spanking", "red", "bed"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_050
```json
{
  "id": "scene_050",
  "generation_prompt": "close-up intimate moment, woman's right hand with manicured nails pinching and twisting man's left nipple between thumb and forefinger applying visible pressure, his face in frame grimacing expression mixing pleasure and pain eyes squeezed shut jaw clenched, she visible behind him leaning over his shoulder with wicked satisfied smile enjoying his reaction, he shirtless muscular chest, she in black bra strap visible, bedroom lighting highlighting their expressions, nipple play pain pleasure",
  "ai_description": "Она щиплет его сосок. Он морщится от удовольствия-боли. Она улыбается хитро. Интимный момент. Игра с сосками.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "щиплет сосок" },
    { "role": "receiving", "gender": "male", "action": "получает боль-удовольствие" }
  ],
  "dimensions": ["nipple_play", "pain_pleasure", "female_control", "pinching"],
  "tags": ["nipple", "pinching", "pain", "pleasure", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_051
```json
{
  "id": "scene_051",
  "generation_prompt": "couple standing in passionate embrace, man behind woman biting her left shoulder where it meets neck, his teeth pressed into her skin, visible red bite marks from previous bites on her shoulder and neck, she tilting her head back to the right eyes closed mouth open in pleasure expression, her right hand reaching back gripping his hip, both nude visible from waist up, his arms wrapped around her torso hands on her stomach, dramatic lighting casting shadows, passionate intensity primal marking",
  "ai_description": "Он страстно кусает её плечо. Она запрокидывает голову от удовольствия. Следы укусов. Страстная интенсивность. Объятия стоя.",
  "participants": [
    { "role": "biting", "gender": "male", "action": "кусает плечо" },
    { "role": "receiving", "gender": "female", "action": "получает, наслаждается" }
  ],
  "dimensions": ["biting", "marking", "passion", "pain_pleasure", "intensity"],
  "tags": ["biting", "shoulder", "marks", "passionate", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_052
```json
{
  "id": "scene_052",
  "generation_prompt": "woman pressing her mouth to man's bare muscular chest biting his pectoral muscle, her teeth creating indentation in his skin, visible red bite marks scattered across his chest from previous bites, his right hand on back of her head fingers in her hair pressing her closer encouraging the bite, his head tilted back eyes closed expression of intense pleasure from pain, she looking up at him while biting with intensity in her eyes, both standing intimate angle, dramatic lighting",
  "ai_description": "Она кусает его грудь. Он держит её голову там. Интенсивность. Следы укусов на коже. Страстная боль. Оба наслаждаются.",
  "participants": [
    { "role": "biting", "gender": "female", "action": "кусает грудь" },
    { "role": "receiving", "gender": "male", "action": "получает, поощряет" }
  ],
  "dimensions": ["biting", "marking", "male_receiving_pain", "intensity"],
  "tags": ["biting", "chest", "marks", "pain", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_053
```json
{
  "id": "scene_053",
  "generation_prompt": "intimate close-up, man's large hand wrapped around woman's throat, fingers on sides of neck thumb on other side, grip firm but not squeezing not choking, applying control not pressure, she looking up at him with complete trust in her eyes lips parted, intense eye contact between them faces close, she lying on back he hovering above, both nude visible shoulders, his expression dominant but caring, her expression surrendered trusting, breath play power exchange visible in their connection",
  "ai_description": "Его рука легко на её горле. Не удушение, но контроль. Зрительный контакт. Доверие. Намёк на breath play. Интенсивная интимность.",
  "participants": [
    { "role": "controlling", "gender": "male", "action": "рука на горле" },
    { "role": "trusting", "gender": "female", "action": "позволяет, доверяет" }
  ],
  "dimensions": ["breath_play", "choking_light", "trust", "control", "intensity"],
  "tags": ["throat", "choking", "control", "trust", "intense"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_054
```json
{
  "id": "scene_054",
  "generation_prompt": "woman straddling man on bed in dominant position, her right hand placed on his throat fingers wrapped around neck applying light controlling pressure not choking, she sitting upright on his hips looking down at him with dominant expression, he lying on back looking up at her with complete trust eyes locked on hers, his hands at his sides not resisting allowing her control, both nude her breasts visible from angle, intense eye contact power exchange visible, moody bedroom lighting female dominance",
  "ai_description": "Её рука легко на его горле. Она сверху. Контролирует. Зрительный контакт. Он полностью доверяет. Обмен властью.",
  "participants": [
    { "role": "controlling", "gender": "female", "action": "рука на горле, сверху" },
    { "role": "trusting", "gender": "male", "action": "позволяет, доверяет" }
  ],
  "dimensions": ["breath_play", "female_dominance", "trust", "control", "woman_on_top"],
  "tags": ["throat", "femdom", "control", "trust", "intense"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 6: Сенсорная игра (сцены 055-062)

### scene_055
```json
{
  "id": "scene_055",
  "generation_prompt": "woman lying on back on white sheets, black silk blindfold covering her eyes, man's hand holding melting ice cube tracing slowly down center of her stomach leaving wet trail with water droplets, visible goosebumps raised on her skin from cold sensation, her abdominal muscles tensing in reaction, she wearing only matching nude panties, her hands gripping sheets at her sides, lips parted in gasp expression reacting to cold, her back slightly arched, soft warm lighting contrasting with cold sensation, temperature play sensory focus",
  "ai_description": "Кубик льда скользит по её животу. Мурашки видны. Она лежит с завязанными глазами. Температурная игра. Сенсорный фокус. Капли воды.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "чувствует лёд, с завязанными глазами" }
  ],
  "dimensions": ["temperature_play", "ice", "sensory", "blindfold", "anticipation"],
  "tags": ["ice", "temperature", "blindfold", "sensory", "goosebumps"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_056
```json
{
  "id": "scene_056",
  "generation_prompt": "man lying on back on dark sheets, black satin blindfold covering his eyes, woman's delicate hand holding melting ice cube pressing and tracing down his bare muscular chest following the line between his pectorals, water droplets trailing behind ice on his skin, visible goosebumps on his arms and chest, his muscles tensing shivering from cold, she sitting beside him wearing black lace bra visible, his expression gasping from cold sensation head tilted back, temperature play sensory teasing contrast of her warm fingers and cold ice",
  "ai_description": "Кубик льда скользит по его груди. Он дрожит. С завязанными глазами. Температурная игра. Её рука держит лёд. Сенсорное дразнение.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "водит льдом" },
    { "role": "receiving", "gender": "male", "action": "чувствует лёд, с завязанными глазами" }
  ],
  "dimensions": ["temperature_play", "ice", "sensory", "blindfold", "teasing"],
  "tags": ["ice", "temperature", "blindfold", "male_receiving", "sensory"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_057
```json
{
  "id": "scene_057",
  "generation_prompt": "woman lying face down on dark sheets, her back bare and exposed, splashes and trails of deep red candle wax already dried on her skin in artistic pattern across her shoulder blades and lower back, fresh hot wax dripping from red candle held above her creating new drops, she arching her back in reaction to heat sensation, her face turned to side expression mixing pain and pleasure eyes squeezed shut, dark room lit only by multiple candles creating dramatic shadows, BDSM wax play temperature sensation",
  "ai_description": "Горячий воск капает на её спину. Она выгибается. Красный воск на коже. BDSM восковая игра. Тёмная комната, свет свечей.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "получает воск" }
  ],
  "dimensions": ["wax_play", "temperature", "pain_pleasure", "sensation", "marks"],
  "tags": ["wax", "candle", "hot", "sensation", "bdsm"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_058
```json
{
  "id": "scene_058",
  "generation_prompt": "man lying on back on dark sheets, his bare muscular chest exposed, trails and pools of black candle wax already hardened on his pectorals and abs in decorative pattern, woman sitting beside him holding lit black candle tilted letting fresh hot wax drip onto his skin, he tensing his abdominal muscles jaw clenched expression of controlled pain-pleasure, she wearing black corset looking down at her work with focused artistic expression, dark moody lighting from candles only, BDSM wax play",
  "ai_description": "Горячий воск капает на его грудь. Он напрягает мышцы. Следы воска на коже. Она держит свечу над ним.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "капает воск" },
    { "role": "receiving", "gender": "male", "action": "получает воск" }
  ],
  "dimensions": ["wax_play", "temperature", "male_receiving", "sensation", "female_control"],
  "tags": ["wax", "candle", "male_receiving", "sensation", "femdom"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_059
```json
{
  "id": "scene_059",
  "generation_prompt": "woman lying on back on white satin sheets, eyes closed with soft smile, large white ostrich feather being traced slowly along her bare stomach and side by unseen hand, visible goosebumps on her skin from ticklish sensation, she wearing only matching cream lace panties, her body slightly squirming from light ticklish touch, one arm above her head other hand loosely gripping sheets, soft diffused lighting creating dreamy atmosphere, light teasing sensory play pleasure visible in her expression",
  "ai_description": "Перо скользит по её телу. Она лежит с закрытыми глазами. Щекотное удовольствие. Мягкое ощущение. Дразнящее прикосновение.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "чувствует перо" }
  ],
  "dimensions": ["feather", "tickling", "teasing", "light_touch", "sensation"],
  "tags": ["feather", "tickle", "soft", "teasing", "sensory"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_060
```json
{
  "id": "scene_060",
  "generation_prompt": "close-up of woman's inner thigh with metal Wartenberg pinwheel being rolled slowly along sensitive skin leaving temporary indentation marks from the tiny spikes, her thigh muscle tensing from pinprick sensation, she lying on back biting her lower lip in anticipation mixed sensation, visible goosebumps around the wheel path, man's hand holding the medical tool handle with control, she wearing only black panties visible at top of frame, soft focused lighting BDSM sensory tool play",
  "ai_description": "Колесо Вартенберга катится по её внутренней стороне бедра. Она кусает губу. Ощущение мелких уколов. BDSM инструмент. Предвкушение.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "чувствует колесо" }
  ],
  "dimensions": ["wartenberg", "pinprick", "sensation", "anticipation", "bdsm_tools"],
  "tags": ["wartenberg", "sensation", "thigh", "bdsm", "tool"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_061
```json
{
  "id": "scene_061",
  "generation_prompt": "man's bare muscular back filling frame, woman's hands with long manicured dark red nails dragging down from his shoulders to lower back leaving light pink scratch marks in their wake, his shoulder muscles tensing shivering from sensation, she standing behind him pressing her body close, visible from behind she wearing black bra, his head tilted forward in pleasure from the scratching sensation, multiple parallel scratch lines visible showing repeated passes, intimate bedroom setting soft lighting sensation play",
  "ai_description": "Она ведёт острыми ногтями по его спине. Лёгкие царапины. Он дрожит. Сенсорная игра. Интимность.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "царапает ногтями" },
    { "role": "receiving", "gender": "male", "action": "чувствует, дрожит" }
  ],
  "dimensions": ["scratching", "nails", "sensation", "light_pain", "teasing"],
  "tags": ["nails", "scratching", "back", "sensation", "couple"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_062
```json
{
  "id": "scene_062",
  "generation_prompt": "woman lying on back completely nude on white sheets, burgundy silk scarf being slowly dragged across her body from her collarbone down between her breasts across her stomach, the silk creating flowing movement over her skin, she eyes closed head tilted back expression of pleasure enjoying the soft texture sensation, her arms relaxed above her head, man's hand visible holding end of scarf guiding it over her curves, soft warm lighting creating sensual atmosphere, texture play light teasing",
  "ai_description": "Шёлковый шарф медленно скользит по её обнажённому телу. Сенсорное дразнение. Мягкая текстура. Она наслаждается ощущением, глаза закрыты.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "чувствует шёлк" }
  ],
  "dimensions": ["silk", "texture", "sensation", "soft_touch", "teasing"],
  "tags": ["silk", "texture", "sensory", "soft", "teasing"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 7: Места и ситуации (сцены 063-072)

### scene_063
```json
{
  "id": "scene_063",
  "generation_prompt": "couple in backseat of car making out passionately, she straddling his lap facing him, her hands on his face pulling him into kiss, his hands on her hips under her hiked up skirt, car windows completely fogged steamy from their breath and body heat, dim parking lot lights visible blurred through foggy glass, confined space creating intimacy, she wearing unbuttoned blouse showing bra underneath, he in loosened tie shirt untucked, night time urgent stolen moment in parking lot",
  "ai_description": "Пара целуется на заднем сиденье машины. Запотевшие окна. Ограниченное пространство. Срочная страсть. Ночь. Парковка видна сквозь туманное стекло.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "целуется" },
    { "role": "equal", "gender": "female", "action": "целуется" }
  ],
  "dimensions": ["car_sex", "confined_space", "steamy", "risky", "spontaneous"],
  "tags": ["car", "backseat", "steamy", "parking", "night"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_064
```json
{
  "id": "scene_064",
  "generation_prompt": "couple against large oak tree in forest, woman's back pressed against rough bark, man pressing against her front pinning her to tree, her legs wrapped around his waist he supporting her with hands under her thighs, her sundress hiked up around her waist panties pulled aside, he in jeans pushed down, dappled sunlight filtering through leaves creating patterns on their skin, secluded forest clearing but sense of risk someone could walk by, her arms around his neck both lost in passion surrounded by nature",
  "ai_description": "Пара у дерева в лесу. Скрытый секс на природе. Пятнистый солнечный свет. Риск быть увиденными. Страсть на природе.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "прижимает к дереву" },
    { "role": "equal", "gender": "female", "action": "прижата к дереву" }
  ],
  "dimensions": ["outdoor_sex", "nature", "risk", "exhibitionism", "spontaneous"],
  "tags": ["forest", "outdoor", "tree", "nature", "risky"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_065
```json
{
  "id": "scene_065",
  "generation_prompt": "corporate office after hours, woman sitting on large wooden desk her pencil skirt hiked up thighs visible, legs spread with man standing between them, her blouse unbuttoned showing black lace bra, his suit jacket off tie loosened shirt partially untucked, her hands pulling him closer by his loosened tie, floor-to-ceiling windows behind them showing city lights at night, desk lamp only light source creating intimate pool of light, scattered papers pushed aside on desk, forbidden workplace romance tension",
  "ai_description": "Пара в офисе. Она сидит на столе, он стоит между её ног. После рабочего дня. Огни города за окном. Запретный роман на работе.",
  "participants": [
    { "role": "active", "gender": "male", "action": "стоит между ног" },
    { "role": "seated", "gender": "female", "action": "сидит на столе" }
  ],
  "dimensions": ["office_sex", "forbidden", "desk", "after_hours", "workplace"],
  "tags": ["office", "desk", "after_hours", "forbidden", "couple"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_066
```json
{
  "id": "scene_066",
  "generation_prompt": "couple on hotel balcony at night, she bent forward gripping metal railing looking out at city lights below, he standing behind her pressed against her, her silk robe open falling off her shoulders revealing nude body beneath, he in unbuttoned shirt and boxers, other high-rise buildings visible across street anyone could look over and see them, city lights twinkling below, sense of exhibitionist thrill and risk, night air and passion combining, urban nightscape backdrop",
  "ai_description": "Пара на балконе отеля ночью. Вид на город внизу. Риск быть увиденными из других зданий. Страсть с эксгибиционистским трепетом.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "на балконе" },
    { "role": "equal", "gender": "female", "action": "на балконе" }
  ],
  "dimensions": ["balcony", "exhibitionism", "hotel", "risk", "city_view"],
  "tags": ["balcony", "hotel", "night", "city", "exhibitionism"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_067
```json
{
  "id": "scene_067",
  "generation_prompt": "couple in department store fitting room, small confined space with full-length mirror on wall, she pressed against mirror her reflection visible behind her, he pressing into her from front, her dress unzipped falling down showing strapless bra, his jeans undone, pile of clothes on small bench they were supposed to be trying on, both trying to stay quiet excited flushed faces, fluorescent fitting room lighting, visible gap under door adding risk element, secret quickie in public space",
  "ai_description": "Пара в примерочной. Ограниченное пространство. Отражение в зеркале. Одежда наполовину снята. Торговый центр. Тайный быстрый секс.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "в примерочной" },
    { "role": "equal", "gender": "female", "action": "в примерочной" }
  ],
  "dimensions": ["public_risk", "fitting_room", "quickie", "mirror", "secret"],
  "tags": ["fitting_room", "mirror", "quickie", "risky", "mall"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_068
```json
{
  "id": "scene_068",
  "generation_prompt": "couple on secluded beach at sunset, lying together on large beach towel on sand, she on top straddling him, both in swimwear her bikini top untied lying beside them his swim trunks pushed down, waves crashing in background out of focus, golden hour light casting warm orange glow on their skin, her hair blowing slightly in ocean breeze, sand visible around the towel, romantic isolated beach location, sunset sky with pink and orange clouds behind them",
  "ai_description": "Пара на пляже на закате. Уединённое место. Волны на заднем плане. Романтический секс на природе. Свет золотого часа. Песок.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "на пляже" },
    { "role": "equal", "gender": "female", "action": "на пляже" }
  ],
  "dimensions": ["beach_sex", "outdoor", "romantic", "sunset", "nature"],
  "tags": ["beach", "sunset", "outdoor", "romantic", "waves"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_069
```json
{
  "id": "scene_069",
  "generation_prompt": "upscale restaurant with white tablecloth, couple seated at table for two, her right hand disappeared under tablecloth clearly reaching toward his lap, his expression trying to maintain composure slight flush on cheeks, she wearing elegant black dress looking at him with naughty knowing smile, wine glasses and candle on table, other diners visible blurred in background completely unaware, public setting secret intimate touching under table, tension between maintaining appearances and secret pleasure",
  "ai_description": "Пара в ресторане. Её рука под скатертью тянется к нему. Тайные прикосновения. Публичное место. Другие посетители не в курсе. Озорная улыбка.",
  "participants": [
    { "role": "teasing", "gender": "female", "action": "тайно касается под столом" },
    { "role": "receiving", "gender": "male", "action": "получает тайные прикосновения" }
  ],
  "dimensions": ["public_teasing", "secret_touch", "restaurant", "thrill", "naughty"],
  "tags": ["restaurant", "public", "secret", "under_table", "teasing"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_070
```json
{
  "id": "scene_070",
  "generation_prompt": "upscale restaurant with white tablecloth, couple at intimate table, his right hand disappeared under tablecloth clearly reaching between her legs, she sitting straight trying to maintain composure but slight flush visible on cheeks and neck, biting her lip subtly, he in suit looking at her with knowing smirk while casually holding wine glass with other hand, candlelight on table, blurred other diners in background unaware, she in cocktail dress legs slightly parted under table, public secret touching thrill",
  "ai_description": "Пара в ресторане. Его рука под скатертью тянется к ней. Тайные прикосновения. Она пытается сохранять самообладание. Публичный трепет.",
  "participants": [
    { "role": "teasing", "gender": "male", "action": "тайно касается под столом" },
    { "role": "receiving", "gender": "female", "action": "получает, держит лицо" }
  ],
  "dimensions": ["public_teasing", "secret_touch", "composure", "thrill"],
  "tags": ["restaurant", "public", "secret", "under_table", "composure"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_071
```json
{
  "id": "scene_071",
  "generation_prompt": "couple pressed against floor-to-ceiling window of high-rise apartment, woman's back and buttocks pressed flat against cold glass, man pressing into her front holding her up, both completely nude, city lights sparkling far below through the glass creating backdrop of tiny lights, interior apartment dark so anyone in buildings across or street below could potentially see their silhouettes, exhibitionist thrill in their expressions, night time urban passion, her hands braced on glass behind her",
  "ai_description": "Пара у окна высотки. Огни города внизу. Эксгибиционистский трепет. Любой мог бы посмотреть вверх и увидеть. Ночная страсть.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "у окна" },
    { "role": "equal", "gender": "female", "action": "у окна" }
  ],
  "dimensions": ["window_sex", "exhibitionism", "high_rise", "city", "risk"],
  "tags": ["window", "high_rise", "city", "exhibitionism", "night"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_072
```json
{
  "id": "scene_072",
  "generation_prompt": "couple in swimming pool at night skinny dipping, water up to their shoulders, she pressed against pool edge he in front of her, their clothes visible piled on pool deck they stripped off, both clearly nude under water skin visible through clear blue pool water, moonlight reflecting on rippling water surface, hotel pool with lounge chairs visible in background, playful expressions having snuck in after hours, sexual tension building under water where their bodies meet, night time romantic mischief",
  "ai_description": "Пара пробирается в бассейн ночью. Отель или частный. Купание голышом. Вода до плеч. Игриво и сексуально. Лунный свет.",
  "participants": [
    { "role": "equal", "gender": "male", "action": "в бассейне" },
    { "role": "equal", "gender": "female", "action": "в бассейне" }
  ],
  "dimensions": ["pool_sex", "skinny_dipping", "night", "playful", "water"],
  "tags": ["pool", "night", "skinny_dipping", "water", "playful"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 8: Групповые динамики (сцены 073-080)

### scene_073
```json
{
  "id": "scene_073",
  "generation_prompt": "MFM threesome on large bed with white sheets, woman in center lying on her side, one man behind her spooning position his hand on her hip, second man in front of her face to face, both men completely nude muscular builds, she completely nude sandwiched between them, all three bodies intertwined, both men focused on her looking at her face and body, she eyes closed in pleasure being center of attention, intimate bedroom with warm lighting, three-way passionate moment",
  "ai_description": "МЖМ тройничок. Женщина между двумя мужчинами. Она в центре внимания. Оба мужчины сосредоточены на её удовольствии. Спальня.",
  "participants": [
    { "role": "giving", "gender": "male", "action": "доставляет удовольствие" },
    { "role": "giving", "gender": "male", "action": "доставляет удовольствие" },
    { "role": "receiving", "gender": "female", "action": "в центре внимания" }
  ],
  "dimensions": ["mfm_threesome", "center_of_attention", "multiple_partners", "pleasure_focus"],
  "tags": ["threesome", "mfm", "two_men", "center_attention", "group"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "both" }
}
```

### scene_074
```json
{
  "id": "scene_074",
  "generation_prompt": "FMF threesome on large bed, man lying on back in center completely nude, two women on either side of him both kneeling on bed leaning over him, one woman kissing his neck her hand on his chest, other woman lower kissing his hip her hand on his thigh, both women in matching black lingerie, he looking up with pleasure expression arms spread relaxed surrendering to attention, both women focused entirely on pleasuring him, warm intimate bedroom lighting king-size bed",
  "ai_description": "ЖМЖ тройничок. Мужчина между двумя женщинами. Обе женщины ублажают его. Он в центре внимания. Спальня.",
  "participants": [
    { "role": "giving", "gender": "female", "action": "доставляет удовольствие" },
    { "role": "giving", "gender": "female", "action": "доставляет удовольствие" },
    { "role": "receiving", "gender": "male", "action": "в центре внимания" }
  ],
  "dimensions": ["fmf_threesome", "center_of_attention", "multiple_partners", "male_fantasy"],
  "tags": ["threesome", "fmf", "two_women", "center_attention", "group"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "both" }
}
```

### scene_075
```json
{
  "id": "scene_075",
  "generation_prompt": "woman sitting in leather armchair in corner of bedroom watching couple on bed having sex, she wearing silk robe open showing lingerie underneath, her right hand between her legs touching herself as she watches, her expression intense desire watching them, couple on bed in missionary position focused on each other possibly unaware of her or aware and performing, she has clear voyeur view of their bodies, dim bedroom lighting from single lamp, voyeuristic pleasure masturbating to watching",
  "ai_description": "Женщина наблюдает как пара занимается сексом. Сидит в кресле. Она трогает себя. Пара на кровати. Смотрит с желанием.",
  "participants": [
    { "role": "voyeur", "gender": "female", "action": "наблюдает, мастурбирует" },
    { "role": "watched", "gender": "male", "action": "занимается сексом" },
    { "role": "watched", "gender": "female", "action": "занимается сексом" }
  ],
  "dimensions": ["voyeurism", "watching", "masturbation", "threesome_adjacent"],
  "tags": ["voyeur", "watching", "masturbation", "couple", "chair"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_076
```json
{
  "id": "scene_076",
  "generation_prompt": "man sitting in dark leather armchair at foot of bed watching couple have sex on bed, he wearing only unbuttoned shirt and boxers leaning forward elbows on knees watching intently, couple on bed in doggy position woman on all fours man behind her, both couple members glancing back at the watcher knowing they have audience, performing for him, exhibitionist dynamic, he watches their bodies move without touching himself just observing, moody bedroom lighting, voyeur and exhibitionism combined",
  "ai_description": "Мужчина наблюдает как пара занимается сексом. Сидит в кресле. Смотрит внимательно. Пара на кровати знает о зрителе. Эксгибиционизм.",
  "participants": [
    { "role": "voyeur", "gender": "male", "action": "наблюдает" },
    { "role": "exhibitionist", "gender": "male", "action": "занимается сексом напоказ" },
    { "role": "exhibitionist", "gender": "female", "action": "занимается сексом напоказ" }
  ],
  "dimensions": ["voyeurism", "exhibitionism", "being_watched", "performance"],
  "tags": ["voyeur", "exhibitionism", "audience", "couple", "performance"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_077
```json
{
  "id": "scene_077",
  "generation_prompt": "couple having sex in bedroom with large window at night, both nude on bed near window, they aware of dark silhouette visible in window reflection or outside watching them, she looking toward window with excited exhibitionist expression knowing they are being watched, he focused on her but also aware of audience, both continuing to perform knowing they have watcher, city lights outside window, interior lit making them visible to outside, exhibitionist thrill visible in their expressions",
  "ai_description": "Пара знает что за ними наблюдают через окно. Эксгибиционистский трепет. Силуэт наблюдателя виден. Они выступают для аудитории.",
  "participants": [
    { "role": "exhibitionist", "gender": "male", "action": "выступает напоказ" },
    { "role": "exhibitionist", "gender": "female", "action": "выступает напоказ" }
  ],
  "dimensions": ["exhibitionism", "being_watched", "performance", "thrill", "window"],
  "tags": ["exhibitionism", "window", "watcher", "performance", "thrill"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_078
```json
{
  "id": "scene_078",
  "generation_prompt": "hotel room with two queen beds side by side, each bed has couple engaged in sex, first couple in missionary on left bed, second couple woman on top on right bed, all four participants occasionally glancing at other couple while continuing their own activity, swinger party atmosphere, all four completely nude, watching each other while being watched, mirrors on walls enhancing views, warm ambient lighting, voyeurism and exhibitionism combined all participants both watchers and watched",
  "ai_description": "Две пары в одной комнате. Атмосфера свингер-вечеринки. Отдельные кровати, но смотрят друг на друга. Вуайеризм и эксгибиционизм вместе.",
  "participants": [
    { "role": "swinger", "gender": "male", "action": "занимается сексом, наблюдает" },
    { "role": "swinger", "gender": "female", "action": "занимается сексом, наблюдает" },
    { "role": "swinger", "gender": "male", "action": "занимается сексом, наблюдает" },
    { "role": "swinger", "gender": "female", "action": "занимается сексом, наблюдает" }
  ],
  "dimensions": ["swinging", "voyeurism", "exhibitionism", "group", "same_room"],
  "tags": ["swingers", "two_couples", "watching", "group", "party"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_079
```json
{
  "id": "scene_079",
  "generation_prompt": "woman lying on back on dark sheets, black silk blindfold covering her eyes, at least four different hands visible touching her body from different angles and positions, one hand on her breast another on her thigh another on her hip another on her neck, she cannot see whose hands are whose creating sensory mystery, her expression pleasure mixed with curiosity, she completely nude surrendered to multiple unknown touches, multiple partners implied by the different hands different sizes and angles, dark intimate lighting sensory overload",
  "ai_description": "Женщина с завязанными глазами. Множество рук касаются её с разных сторон. Она не знает чьи руки. Сенсорная загадка. Подразумеваются несколько партнёров.",
  "participants": [
    { "role": "receiving", "gender": "female", "action": "с завязанными глазами, получает касания" },
    { "role": "touching", "gender": "any", "action": "касается" }
  ],
  "dimensions": ["blindfold", "multiple_hands", "mystery", "sensory", "group"],
  "tags": ["blindfold", "multiple_hands", "mystery", "group", "sensory"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_080
```json
{
  "id": "scene_080",
  "generation_prompt": "man lying on back on white sheets, black satin blindfold covering his eyes, multiple feminine hands with painted nails touching his body from different angles, one hand on his chest another on his thigh another tracing his abs another on his shoulder, he cannot see whose hands creating mystery and anticipation, his expression pleasure and slight tension from sensory overload, he completely nude muscular body receiving multiple touches, at least three different hands visible with different nail colors implying multiple women, soft lighting intimate atmosphere",
  "ai_description": "Мужчина с завязанными глазами. Множество рук касаются его с разных сторон. Загадка чьи руки. Подразумеваются несколько партнёров. Сенсорная перегрузка.",
  "participants": [
    { "role": "receiving", "gender": "male", "action": "с завязанными глазами, получает касания" },
    { "role": "touching", "gender": "any", "action": "касается" }
  ],
  "dimensions": ["blindfold", "multiple_hands", "mystery", "sensory", "male_receiving"],
  "tags": ["blindfold", "multiple_hands", "mystery", "group", "male_sub"],
  "intensity": 4,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 9: Ролевые игры (сцены 081-088)

### scene_081
```json
{
  "id": "scene_081",
  "generation_prompt": "corporate office roleplay scene, man in executive chair behind large wooden desk wearing full suit and power tie, confident dominant posture leaning back, woman in stereotypical secretary outfit tight white blouse unbuttoned showing cleavage short pencil skirt and heels, she bent forward over his desk hands flat on surface presenting cleavage to him, looking at him with mix of submission and seduction, papers and laptop on desk, large office with city view window behind, clear boss-secretary power dynamic",
  "ai_description": "Ролевая игра босс и секретарша. Он сидит в офисном кресле. Она в короткой юбке наклоняется над столом. Динамика власти. Корпоративная обстановка.",
  "participants": [
    { "role": "boss", "gender": "male", "action": "в кресле, в позиции власти" },
    { "role": "secretary", "gender": "female", "action": "наклоняется, подчинённая роль" }
  ],
  "dimensions": ["roleplay", "boss_secretary", "power_dynamic", "office", "submission"],
  "tags": ["roleplay", "boss", "secretary", "office", "power"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_082
```json
{
  "id": "scene_082",
  "generation_prompt": "corporate office roleplay with reversed power roles, woman sitting in executive leather chair behind large desk wearing power suit blazer and pencil skirt, confident dominant expression hands steepled or on desk, man standing before her desk in subordinate position wearing dress shirt and slacks no jacket, nervous body language hands clasped in front looking down, she the boss he the subordinate, her expression evaluating him, modern corner office with city view, female power dynamic clear",
  "ai_description": "Ролевая игра босс и работник. Она сидит в позиции власти. Он стоит нервно. Женщина-босс, мужчина-подчинённый. Офис с обратными ролями.",
  "participants": [
    { "role": "boss", "gender": "female", "action": "в позиции власти" },
    { "role": "subordinate", "gender": "male", "action": "подчинённая роль" }
  ],
  "dimensions": ["roleplay", "female_boss", "power_dynamic", "office", "role_reversal"],
  "tags": ["roleplay", "female_boss", "office", "power", "role_reversal"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_083
```json
{
  "id": "scene_083",
  "generation_prompt": "medical examination roleplay, woman sitting on edge of examination table wearing thin paper medical gown tied in back showing bare shoulders and legs, looking somewhat vulnerable, man in white doctor coat with stethoscope around neck standing beside her, one hand holding stethoscope to her chest other hand on her shoulder, clinical examination room with medical equipment visible, cold fluorescent lighting contrasting with erotic tension between them, professional facade hiding sexual dynamic",
  "ai_description": "Ролевая игра доктор и пациент. Женщина в медицинском халате на смотровом столе. Мужчина в белом халате со стетоскопом. Клинически но эротично.",
  "participants": [
    { "role": "doctor", "gender": "male", "action": "осматривает" },
    { "role": "patient", "gender": "female", "action": "на смотровом столе" }
  ],
  "dimensions": ["roleplay", "doctor_patient", "medical", "examination", "vulnerability"],
  "tags": ["roleplay", "doctor", "patient", "medical", "examination"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_084
```json
{
  "id": "scene_084",
  "generation_prompt": "nurse patient roleplay in bedroom, woman in sexy nurse costume white dress with red crosses very short skirt white stockings nurse cap, she leaning over man who lies in bed as patient, her hand on his forehead checking temperature other hand on his chest, he wearing only boxers looking up at her with mix of vulnerability and desire, she with caring but seductive expression, bedroom dressed as makeshift hospital room, nurturing yet erotic dynamic she in control of his care",
  "ai_description": "Ролевая игра медсестра и пациент. Женщина в костюме медсестры. Мужчина в кровати как пациент. Она ухаживает за ним. Медицинская ролевая игра. Заботливо и эротично.",
  "participants": [
    { "role": "nurse", "gender": "female", "action": "ухаживает, контролирует" },
    { "role": "patient", "gender": "male", "action": "в кровати, получает уход" }
  ],
  "dimensions": ["roleplay", "nurse_patient", "medical", "nurturing", "female_control"],
  "tags": ["roleplay", "nurse", "patient", "medical", "caring"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_085
```json
{
  "id": "scene_085",
  "generation_prompt": "bar stranger pickup roleplay, upscale bar with dark wood and ambient lighting, woman sitting alone at bar on stool wearing cocktail dress and heels, man approaching from side leaning on bar trying to get her attention, both pretending they don't know each other playing strangers, she playing coy looking at him over shoulder, he confident smile offering to buy drink, glasses of wine and cocktails on bar, exciting tension of pretending to be strangers meeting for first time, flirtatious body language",
  "ai_description": "Ролевая игра знакомство с незнакомцем. Бар. Они притворяются что не знают друг друга. Флиртуют как при первой встрече. Захватывающая игра.",
  "participants": [
    { "role": "stranger", "gender": "male", "action": "подкатывает" },
    { "role": "stranger", "gender": "female", "action": "позволяет подкатить" }
  ],
  "dimensions": ["roleplay", "strangers", "bar_pickup", "pretense", "excitement"],
  "tags": ["roleplay", "strangers", "bar", "pickup", "flirting"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_086
```json
{
  "id": "scene_086",
  "generation_prompt": "french maid roleplay in elegant bedroom, woman in classic sexy french maid costume black dress with white lace apron very short skirt showing tops of thigh-high stockings white lace headpiece feather duster in hand, she caught in act of cleaning bent over slightly, man in robe or casual expensive clothes standing in doorway watching her with possessive gaze, she looking back over shoulder caught expression, power dynamic of house owner and domestic servant, luxurious bedroom setting",
  "ai_description": "Ролевая игра горничная и хозяин. Женщина в костюме французской горничной. Он застаёт её. Домашняя динамика власти. Спальня.",
  "participants": [
    { "role": "owner", "gender": "male", "action": "хозяин, застаёт" },
    { "role": "maid", "gender": "female", "action": "горничная, застигнута" }
  ],
  "dimensions": ["roleplay", "maid", "uniform", "power_dynamic", "domestic"],
  "tags": ["roleplay", "maid", "french_maid", "uniform", "domestic"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_087
```json
{
  "id": "scene_087",
  "generation_prompt": "butler and mistress roleplay in elegant drawing room, man in formal butler attire black tailcoat white gloves carrying silver serving tray, standing in deferential posture slight bow, woman lounging on chaise in silk robe or elegant dress playing wealthy mistress, she holding out empty wine glass imperiously for him to refill, looking at him with commanding superior expression, he with devoted subservient gaze, elegant room with fireplace and expensive furniture, domestic service role reversal power dynamic",
  "ai_description": "Ролевая игра дворецкий и хозяйка. Мужчина в одежде дворецкого. Женщина как богатая хозяйка. Он служит ей. Домашние обратные роли. Элегантная обстановка.",
  "participants": [
    { "role": "mistress", "gender": "female", "action": "хозяйка, командует" },
    { "role": "butler", "gender": "male", "action": "дворецкий, служит" }
  ],
  "dimensions": ["roleplay", "service", "female_power", "butler", "elegance"],
  "tags": ["roleplay", "butler", "mistress", "service", "elegant"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_088
```json
{
  "id": "scene_088",
  "generation_prompt": "photographer model roleplay in photo studio, man holding professional camera pointing it at her giving directions with free hand gesturing how to pose, wearing casual creative professional clothes, woman in lingerie or implied nude with silk sheet draped, posing on white backdrop following his directions, large studio lights and softboxes visible creating professional setup, she looking at camera seductively, charged artistic tension between photographer control and model vulnerability, visible tripod and equipment",
  "ai_description": "Ролевая игра фотограф и модель. Он направляет её позы. Она следует инструкциям. Студия. Художественно но напряжённо. Камера видна.",
  "participants": [
    { "role": "photographer", "gender": "male", "action": "направляет, командует" },
    { "role": "model", "gender": "female", "action": "позирует, следует" }
  ],
  "dimensions": ["roleplay", "photographer", "model", "direction", "posing"],
  "tags": ["roleplay", "photographer", "model", "studio", "posing"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## РАЗДЕЛ 10: Соло и фетиши (сцены 089-100)

### scene_089
```json
{
  "id": "scene_089",
  "generation_prompt": "woman alone in bed masturbating, lying on back on white tangled sheets, eyes closed head tilted back on pillow expression of pleasure, her left hand on her breast squeezing nipple, right hand between her spread legs fingers on clitoris in circular motion, completely nude body arched slightly, soft warm lamp light from bedside, intimate private solo moment of self pleasure, no partner just her own pleasure focus, bedroom atmosphere peaceful and sensual",
  "ai_description": "Женщина одна мастурбирует в кровати. Глаза закрыты. Самоудовлетворение. Интимный одиночный момент. Мягкий свет. Простыни смяты.",
  "participants": [
    { "role": "solo", "gender": "female", "action": "мастурбирует" }
  ],
  "dimensions": ["masturbation", "solo", "self_pleasure", "female_solo"],
  "tags": ["solo", "masturbation", "female", "bed", "self_pleasure"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_090
```json
{
  "id": "scene_090",
  "generation_prompt": "man alone in bedroom masturbating, lying on back on bed dark sheets slightly tangled, one hand wrapped around himself stroking, other hand behind his head on pillow, eyes closed jaw clenched in pleasure expression, completely nude muscular body, natural private solo moment of self pleasure, soft moody lighting from window or lamp, intimate vulnerable male moment without partner, focused on his own sensation",
  "ai_description": "Мужчина один мастурбирует. Одиночный момент. Самоудовлетворение. Спальня. Интимно. Естественно.",
  "participants": [
    { "role": "solo", "gender": "male", "action": "мастурбирует" }
  ],
  "dimensions": ["masturbation", "solo", "self_pleasure", "male_solo"],
  "tags": ["solo", "masturbation", "male", "bedroom", "self_pleasure"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "male" }
}
```

### scene_091
```json
{
  "id": "scene_091",
  "generation_prompt": "woman alone in bed using vibrator, lying propped against pillows on white sheets, legs spread bent at knees, right hand holding purple vibrator pressed between her legs against her clitoris, left hand gripping sheets beside her, eyes closed expression of building pleasure slight flush on cheeks, she wearing only t-shirt pushed up exposing stomach, comfortable intimate solo session with toy, bedside table with lubricant bottle visible, soft bedroom lighting private moment",
  "ai_description": "Женщина использует вибратор одна в кровати. Игрушка видна. Одиночное удовольствие. Интимный момент. Комфортно.",
  "participants": [
    { "role": "solo", "gender": "female", "action": "использует вибратор" }
  ],
  "dimensions": ["toys", "vibrator", "solo", "female_pleasure"],
  "tags": ["vibrator", "toy", "solo", "female", "pleasure"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_092
```json
{
  "id": "scene_092",
  "generation_prompt": "woman standing wearing only high stiletto heels, completely nude otherwise, standing in confident pose one hand on hip other arm relaxed, legs emphasized by heels creating long leg line, calves and thighs defined by heel height, standing on hardwood floor or plush carpet, studio lighting emphasizing her silhouette, fetish aesthetic focus on legs and heels, powerful confident feminine energy radiating from her posture, looking at camera with self-assured expression",
  "ai_description": "Женщина только в высоких каблуках. Стоит уверенно. Акцент на ногах. Фетиш-эстетика. Мощная женственная энергия.",
  "participants": [
    { "role": "solo", "gender": "female", "action": "позирует в каблуках" }
  ],
  "dimensions": ["heels_fetish", "legs", "confidence", "aesthetics"],
  "tags": ["heels", "fetish", "legs", "confident", "solo"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_093
```json
{
  "id": "scene_093",
  "generation_prompt": "woman in full black latex catsuit, shiny reflective material catching studio light, suit covering from neck to wrists to ankles like second skin, every curve emphasized by tight latex, standing in dominant confident pose hands on hips or one hand raised, high heels matching outfit, studio setting with dramatic side lighting highlighting latex shine, fetish fashion aesthetic, her expression confident imperious slightly cruel, dominant energy radiating from posture",
  "ai_description": "Женщина в чёрном латексном наряде. Блестящий материал. Доминирующая эстетика. Уверенная поза. Фетиш-мода.",
  "participants": [
    { "role": "solo", "gender": "female", "action": "в латексе, позирует" }
  ],
  "dimensions": ["latex_fetish", "material", "dominance", "aesthetics", "fashion"],
  "tags": ["latex", "fetish", "black", "dominant", "fashion"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_094
```json
{
  "id": "scene_094",
  "generation_prompt": "man kneeling on floor at woman's feet, both hands cradling her bare foot lifted to his face, his lips pressed to her arch or toes in reverent kiss, looking up at her with devoted adoring expression, she sitting in elegant armchair wearing silk robe legs crossed other foot dangling, looking down at him with satisfied superior expression, her toenails painted red, soft bedroom lighting, foot worship devotional position clear submission and adoration, intimate fetish moment",
  "ai_description": "Мужчина целует ногу женщины. Поклонение ногам. Она сидит на стуле, он на коленях. Девоциональная позиция. Фут-фетиш. Интимно.",
  "participants": [
    { "role": "worshipping", "gender": "male", "action": "целует ноги" },
    { "role": "worshipped", "gender": "female", "action": "получает поклонение" }
  ],
  "dimensions": ["foot_fetish", "worship", "kneeling", "devotion", "submission"],
  "tags": ["feet", "worship", "kneeling", "fetish", "devotion"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_095
```json
{
  "id": "scene_095",
  "generation_prompt": "woman sitting on edge of bed in elegant lingerie set, wearing black lace bra matching panties black garter belt with straps attached to sheer black thigh-high stockings, sitting with legs slightly apart one hand on thigh other on bed behind her for support, looking toward camera with seductive half-smile, soft boudoir lighting creating intimate atmosphere, luxurious bedroom setting with satin sheets visible, classic sensual pin-up aesthetic, confident in her sexuality",
  "ai_description": "Женщина в элегантном белье. Чулки и пояс для чулок. Сидит на краю кровати. Соблазнительный взгляд. Будуарная эстетика. Чувственно.",
  "participants": [
    { "role": "solo", "gender": "female", "action": "в белье, соблазняет" }
  ],
  "dimensions": ["lingerie", "stockings", "seduction", "aesthetics", "boudoir"],
  "tags": ["lingerie", "stockings", "garter", "seductive", "boudoir"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_096
```json
{
  "id": "scene_096",
  "generation_prompt": "woman taking lingerie selfie in full-length mirror, holding smartphone up with right hand screen facing mirror, she wearing matching red lace bra and panties, standing in slight hip-pop pose other hand on hip, looking at phone screen not directly at mirror, bedroom visible in reflection with bed behind her, modern sexting scenario sending pics to someone, playful seductive expression, bedroom lighting from window, phone clearly visible showing camera app",
  "ai_description": "Женщина делает селфи в зеркале. В белье. Телефон виден. Отправляет фото кому-то. Современный секстинг. Спальня.",
  "participants": [
    { "role": "sending", "gender": "female", "action": "делает селфи, отправляет" }
  ],
  "dimensions": ["sexting", "selfie", "mirror", "distance", "teasing"],
  "tags": ["sexting", "selfie", "mirror", "phone", "lingerie"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "female" }
}
```

### scene_097
```json
{
  "id": "scene_097",
  "generation_prompt": "man taking shirtless selfie in bathroom mirror, holding phone up with one hand showing camera screen in reflection, other arm tensed flexing slightly showing muscle definition, wearing only low-riding jeans or sweatpants showing v-line above waistband, standing in bathroom with clean modern fixtures visible, confident expression slight smirk, good lighting from bathroom lights highlighting physique, modern sexting scenario about to send pic, phone clearly visible in frame",
  "ai_description": "Мужчина делает селфи без рубашки в зеркале. Телефон виден. Отправляет фото. Современный секстинг. Уверенная поза.",
  "participants": [
    { "role": "sending", "gender": "male", "action": "делает селфи, отправляет" }
  ],
  "dimensions": ["sexting", "selfie", "mirror", "distance", "male_body"],
  "tags": ["sexting", "selfie", "mirror", "phone", "shirtless"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "male" }
}
```

### scene_098
```json
{
  "id": "scene_098",
  "generation_prompt": "split scene showing video call between couple in different locations, she on left side sitting in front of laptop webcam wearing black lingerie showing off to camera, laptop screen shows his face watching her, he on right side lying in bed holding phone or watching laptop, his screen shows her in lingerie, both looking at their screens with desire, long distance intimacy through technology, screens visible showing their faces, modern relationship communication, bedroom settings both sides",
  "ai_description": "Пара на видеозвонке. Она показывает бельё на экране. Он смотрит из своего места. Интимность на расстоянии. Экраны видны. Современная связь.",
  "participants": [
    { "role": "showing", "gender": "female", "action": "показывает в камеру" },
    { "role": "watching", "gender": "male", "action": "смотрит на экран" }
  ],
  "dimensions": ["video_call", "long_distance", "showing", "teasing", "technology"],
  "tags": ["video_call", "long_distance", "screens", "lingerie", "modern"],
  "intensity": 2,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_099
```json
{
  "id": "scene_099",
  "generation_prompt": "woman standing tall in dominant power stance, both hands on her hips elbows out, looking down with commanding expression, she wearing black corset garter stockings and heels, man kneeling at her feet sitting back on heels, looking up at her with adoring worshipping expression, his hands on his thighs palms up in submissive gesture, he wearing only collar around neck, clear height difference emphasizing her power, dramatic lighting from above casting shadows, power exchange dynamic unmistakable",
  "ai_description": "Женщина стоит над коленопреклонённым мужчиной. Её руки на бёдрах. Доминирующая стойка. Он смотрит на неё с обожанием. Явный обмен властью.",
  "participants": [
    { "role": "dominant", "gender": "female", "action": "стоит над, доминирует" },
    { "role": "submissive", "gender": "male", "action": "на коленях, обожает" }
  ],
  "dimensions": ["female_dominance", "power_exchange", "worship", "kneeling", "adoration"],
  "tags": ["femdom", "kneeling", "worship", "power", "standing_over"],
  "intensity": 3,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

### scene_100
```json
{
  "id": "scene_100",
  "generation_prompt": "intimate aftercare moment post-scene, couple cuddling in bed wrapped in soft grey blanket, she curled against his chest in fetal position, he spooning her protectively arms wrapped around her, both looking peaceful and connected coming down from intensity, her eyes closed safe expression, his chin resting on top of her head protective, visible marks or rope impressions on her skin suggesting earlier BDSM play, soft warm lamp light, emotional tenderness and safety, intimate recovery together",
  "ai_description": "Интимный момент aftercare. Пара обнимается после интенсивности. Нежные объятия. Спускаются с пика. Эмоциональная связь. Плед. Мягкий свет.",
  "participants": [
    { "role": "caring", "gender": "male", "action": "обнимает, заботится" },
    { "role": "cared_for", "gender": "female", "action": "в объятиях, восстанавливается" }
  ],
  "dimensions": ["aftercare", "tenderness", "emotional_connection", "coming_down", "safety"],
  "tags": ["aftercare", "cuddling", "blanket", "tender", "emotional"],
  "intensity": 1,
  "relevant_for": { "gender": "any", "interested_in": "any" }
}
```

---

## Сводка по сценам

| Раздел | Сцены | Кол-во |
|--------|-------|--------|
| Романтика и нежность | 001-012 | 12 |
| Страсть и интенсивность | 013-024 | 12 |
| Оральные удовольствия | 025-032 | 8 |
| BDSM — Bondage | 033-044 | 12 |
| Impact play и боль | 045-054 | 10 |
| Сенсорная игра | 055-062 | 8 |
| Места и ситуации | 063-072 | 10 |
| Групповые динамики | 073-080 | 8 |
| Ролевые игры | 081-088 | 8 |
| Соло и фетиши | 089-100 | 12 |
| **ИТОГО** | | **100** |

---

## Покрытие измерений

- ✅ Романтика/нежность
- ✅ Страсть/интенсивность
- ✅ Оральный секс (обе роли)
- ✅ Bondage (мягкий и жёсткий)
- ✅ Blindfold
- ✅ Spanking/impact
- ✅ Domination/submission (оба пола)
- ✅ Ролевые игры (разные сценарии)
- ✅ Места (дом, улица, публичные)
- ✅ Voyeurism/Exhibitionism
- ✅ Групповой секс (MFM, FMF)
- ✅ Сенсорная игра (температура, текстуры)
- ✅ Фетиши (ноги, латекс, бельё)
- ✅ Соло/мастурбация
- ✅ Секстинг/дистанционное
- ✅ Aftercare

---

## Баланс ролей

- ~50% сцен где М доминирует/активен
- ~50% сцен где Ж доминирует/активна
- Много "равных" сцен
- Дубликаты с поменянными ролями (сцены X и X+1)
