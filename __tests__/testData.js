const testUser1 = {
    userName: "TestUser1",
    password: "password",
    email: "asdf@asdf.com",
    wantsNutritionData: true
}

const testUser2 = {
    userName: "TestUser2",
    password: "password",
    email: "asdf2@asdf.com",
    wantsNutritionData: false
}

const moroccanlentilsoup = {
    recipeName: "Moroccan Lentil Soup",
    ingredients: [{
        label: "Lemon Juice",
        measurement: "tablespoons",
        quantity: 2.0
    }, {
        label: "Cilantro",
        measurement: "cup",
        quantity: 0.5
    }, {
        label: "Spinach",
        measurement: "cup",
        quantity: 4.0,
        prepInstructions: "chopped"
    }, {
        label: "Tomato Paste",
        measurement: "tablespoons",
        quantity: 2.0
    }, {
        label: "Tomato",
        measurement: "can",
        quantity: 1.0,
        prepInstructions: "28 ounce"
    }, {
        label: "Red lentils",
        measurement: "cup",
        quantity: 1.750
    }, {
        label: "Cauliflower",
        measurement: "cup",
        quantity: 3,
        prepInstructions: "chopped"
    }, {
        label: "Water",
        measurement: "cup",
        quantity: 2
    }, {
        label: "Vegetable Broth",
        measurement: "cup",
        quantity: 6.0
    }, {
        label: "Pepper",
        measurement: "teaspoon",
        quantity: 0.25
    }, {
        label: "Ground cinnamon",
        measurement: "teaspoon",
        quantity: 0.25
    }, {
        label: "Turmeric",
        measurement: "teaspoon",
        quantity: 1
    }, {
        label: "Coriander Powder",
        measurement: "teaspoon",
        quantity: 1.0
    }, {
        label: "Ground Cumin",
        measurement: "teaspoon",
        quantity: 1
    }, {
        label: "Garlic",
        measurement: "whole",
        quantity: 4.0,
        prepInstructions: "minced clove"
    }, {
        label: "Carrot",
        measurement: "cup",
        quantity: 2.0
    }, {
        label: "Onion",
        measurement: "cup",
        quantity: 2.0,
        prepInstructions: "chopped"
    }, {
        label: "Olive Oil",
        measurement: "teaspoon",
        quantity: 2.0
    }],
    instructions: ["1. Heat oil in a soup pot or Dutch oven over medium heat; add onions and carrots and cook, stirring occasionally, until softened, about 10 minutes. Stir in garlic and cook for 30 seconds. Add cumin, coriander, turmeric, cinnamon and pepper; cook, stirring, until fragrant, about 1 minute.", "2. Add broth, water, cauliflower, lentils, tomatoes and tomato paste; bring to a boil. Reduce heat and simmer, partially covered, stirring occasionally, until the lentils are tender but not mushy, 45 to 55 minutes. If cooking in instapot, omit the water, and cook at high pressure for 7.5 minutes.", "3. Stir in spinach and cook until wilted, 5 minutes.", "4. Just before serving, stir in cilantro and lemon juice."],
    servingCount: 12,
    minutePrepTime: 30,
    minuteCookTime: 60,
    minuteTotalTime: 90,
    mealCategory: ["Lunch", "Dinner", "Soup"]
}

const humus = {
    recipeName: "Hummus",
    mealCategory: [],
    dietCategory: [],
    instructions: ["1. In a food processor, puree the chickpeas and garlic with the olive oil, lemon juice, tahini (if using), cumin, and ¾ teaspoon salt until smooth and creamy. Add 1 to 2 tablespoons water as necessary to achieve the desired consistency.", "2. Transfer to a bowl. Drizzle with olive oil and sprinkle with the paprika before serving."],
    servingCount: 4,
    toolsNeeded: "Instapot, immersion blender",
    ingredients: [{
        label: "Smoked Paprika",
        measurement: "teaspoon",
        quantity: 0.25
    }, {
        label: "Salt",
        measurement: "teaspoon",
        quantity: 1.0
    }, {
        label: "Tahini",
        measurement: "tablespoon",
        quantity: 2.0

    }, {
        label: "Ground Cumin",
        measurement: "teaspoon",
        quantity: 1.0
    }, {
        label: "Lemon Juice",
        measurement: "tablespoon",
        quantity: 2.0
    }, {
        label: "Olive Oil",
        measurement: "cup",
        quantity: 0.25
    }, {
        label: "Garlic",
        measurement: "whole",
        quantity: 1.0,
        prepInstructions: "Clove"
    }, {
        label: "Chickpeas",
        measurement: "Can",
        quantity: 1.0,
        prepInstructions: "15 ounce can",
    }, {
        label: "Pepper",
        measurement: "Teaspoon",
        quantity: 0.25,
        prepInstructions: "ground"
    }]
}

const rasam = {
    recipeName: "Rasam",
    mealCategory: [
        "dinner",
        "soup",
        "indian",
    ],
    dietCategory: ["vegan", "vegetarian", "glutenfree"],
    instructions: ["1. Wash and soak the masoor dal for 10 minutes.",
        "2. Meanwhile, chop the tomato finely.",
        "3. Mix the 1 tbsp of tamarind paste with 1 cup of water and set aside.",
        "4. Add the tamarind water, washed and soaked Toor dal, chopped tomato, salt, hing, ground pepper and rasam powder directly to the instant pot. Then add 2 cups of water.",
        "5. Mix them thoroughly and cook this rasam mix in manual mode for 10 minutes and release the pressure naturally.",
        "6. Once the pressure is released, open the IP lid and then set the IP in saute mode.",
        "7. Mash the rasam mix nicely so that the dal blends well.",
        "8. Add half more cup of water and let it simmer for 5 minutes.",
        "9. Meanwhile, do the tempering separately over stop top. Heat the tempering pan or kadai and add oil. Once the oil is hot, add the mustard seeds, cumin seeds, and mint leaves and as the mustard seeds start to splutter, add it to the rasam."
    ],
    toolsNeeded: "Instapot",
    ingredients: [{
            label: "Mustard Seed",
            measurement: "Teaspoon",
            quantity: 1,
        },
        {
            label: "Ghee",
            measurement: "Tablespoon",
            quantity: 1,
        },
        {
            label: "Toor Dal",
            measurement: "Cups",
            quantity: 0.5,
        },
        {
            label: "Rasam powder",
            measurement: "Tablespoon",
            quantity: 1,
        },
        {
            label: "Water",
            measurement: "Cups",
            quantity: 3.5,
        },
        {
            label: "Tamarind Paste",
            measurement: "Tablespoon",
            quantity: 1,
        },
        {
            label: "Tomato",
            measurement: "Whole",
            quantity: 1,
            prepInstructions: "skinned and chopped"
        }
    ]
}

const bethsSoupBroth = {
    recipeName: "Beth's soup broth",
    mealCategory: [
        "dinner",
        "snack"
    ],
    dietCategory: [
        "vegan",
        "vegetarian",
        "glutenfree"
    ],
    servingCount: 4,
    websiteReference: "https://www.foodrecipe.website",
    farenheitTemp: 300,
    minuteTimeBake: 15,
    minuteTotalTime: 30,
    minutePrepTime: 15,
    instructions: ["Add vegetable broth to a pot of boiling water and stir in other seasoning to get the right flavor."],
    toolsNeeded: "A big pot. A stove. a ladel",
    ingredients: [{
            label: "vegetable soup stock",
            measurement: "tablespoon",
            quantity: 4,
            prepInstructions: "gelled soup stock",
            additionalInfo: "I like the kind that I find at SuperSaverSmart",
            neededInStep: 0
        },
        {
            label: "water",
            measurement: "cup",
            quantity: 4,
            prepInstructions: "deionized",
            additionalInfo: "you can also use distilled"
        }
    ]
}

const chickenSalad = {
    recipeName: "Chicken Salad",
    servingCount: 6,
    minuteTotalTime: 15,
    instructions: ["1. Combine all ingredients in a small bowl and mix well.", "2. Season with salt and pepper to taste.", "3.Serve as a sandwich or over salad."],
    toolsNeeded: "Spoon, knife, bowl",
    ingredients: [{
            quantity: 2,
            measurement: "cup",
            label: "chicken",
            prepInstructions: "chopped"
        },
        {
            quantity: 0.5,
            measurement: "cup",
            label: "mayonnaise",
            neededInStep: 2
        },
        {
            quantity: 1,
            measurement: "cup",
            label: "celery stalk",
            prepInstructions: "chopped",
            neededInStep: 2
        },
        {
            quantity: 1,
            measurement: "whole",
            label: "green onion",
            prepInstructions: "diced",
            neededInStep: 2
        },
        {
            quantity: 1,
            measurement: "teaspoon",
            label: "seasoned salt",
            neededInStep: 2
        },
        {
            quantity: 0,
            measurement: "pinch",
            label: "pepper",
            prepInstructions: "to taste",
            neededInStep: 2
        }
    ]
};

module.exports = {
    bethsSoupBroth,
    chickenSalad,
    rasam,
    humus,
    moroccanlentilsoup,
    testUser1,
    testUser2,
}