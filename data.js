// All sizes in meters
const lifeObjects = [
    // Subatomic & Atomic
    { name: "Planck Length", size: 1.6e-35, description: "The smallest measurable length in physics", color: "#ff00ff", category: "quantum" },
    { name: "Proton", size: 8.4e-16, description: "Subatomic particle in the nucleus of an atom", color: "#ff0080", category: "quantum" },
    { name: "Hydrogen Atom", size: 1.2e-10, description: "The smallest and most abundant atom in the universe", color: "#ff4080", category: "atomic" },
    { name: "Water Molecule", size: 2.8e-10, description: "H₂O - Essential for all known life", color: "#4080ff", category: "atomic" },
    
    // Molecular & Cellular
    { name: "DNA Width", size: 2e-9, description: "Double helix structure carrying genetic information", color: "#00ff80", category: "molecular" },
    { name: "Virus (HIV)", size: 1.2e-7, description: "One of the smallest viruses", color: "#ff8040", category: "virus" },
    { name: "Bacteria (E. coli)", size: 2e-6, description: "Common bacteria found in intestines", color: "#80ff40", category: "cell" },
    { name: "Red Blood Cell", size: 8e-6, description: "Carries oxygen throughout the body", color: "#ff4040", category: "cell" },
    { name: "Human Egg Cell", size: 1.2e-4, description: "Largest human cell, visible to naked eye", color: "#ffff80", category: "cell" },
    
    // Small Organisms
    { name: "Grain of Sand", size: 5e-4, description: "Fine sand particle", color: "#d4a574", category: "object" },
    { name: "Human Hair Width", size: 7e-5, description: "Diameter of a single hair strand", color: "#8b7355", category: "object" },
    { name: "Dust Mite", size: 3e-4, description: "Microscopic arachnid living in house dust", color: "#c0c0c0", category: "animal" },
    { name: "Flea", size: 2e-3, description: "Tiny jumping insect", color: "#404040", category: "animal" },
    { name: "Ant", size: 5e-3, description: "Common worker ant", color: "#8b4513", category: "animal" },
    { name: "Honeybee", size: 1.5e-2, description: "Important pollinator", color: "#ffd700", category: "animal" },
    
    // Medium Organisms
    { name: "Hummingbird", size: 0.08, description: "Smallest bird species", color: "#00ff00", category: "animal" },
    { name: "Mouse", size: 0.1, description: "Common small rodent", color: "#808080", category: "animal" },
    { name: "Baseball", size: 0.074, description: "Standard baseball diameter", color: "#ffffff", category: "object" },
    { name: "Cat", size: 0.46, description: "Domestic feline", color: "#ff8040", category: "animal" },
    { name: "Human (average)", size: 1.7, description: "Average human height", color: "#ffd0a0", category: "human" },
    { name: "Door", size: 2.0, description: "Standard door height", color: "#8b4513", category: "object" },
    
    // Large Organisms & Objects
    { name: "Giraffe", size: 5.5, description: "Tallest land animal", color: "#daa520", category: "animal" },
    { name: "Elephant (African)", size: 6.5, description: "Largest land animal", color: "#808080", category: "animal" },
    { name: "School Bus", size: 11, description: "Standard school bus length", color: "#ffff00", category: "object" },
    { name: "Blue Whale", size: 30, description: "Largest animal ever known", color: "#4169e1", category: "animal" },
    { name: "Statue of Liberty", size: 93, description: "Height including pedestal", color: "#80ff80", category: "object" },
    { name: "Football Field", size: 110, description: "Length of American football field", color: "#00ff00", category: "object" },
    
    // Massive Objects
    { name: "Eiffel Tower", size: 330, description: "Iconic Parisian landmark", color: "#8b7355", category: "object" },
    { name: "Empire State Building", size: 443, description: "New York City skyscraper", color: "#c0c0c0", category: "object" },
    { name: "Burj Khalifa", size: 828, description: "Tallest building in the world", color: "#silver", category: "object" },
    { name: "Mount Everest", size: 8849, description: "Tallest mountain on Earth", color: "#ffffff", category: "earth" },
    { name: "Mariana Trench", size: 11034, description: "Deepest ocean trench", color: "#000080", category: "earth" },
    
    // Planetary & Cosmic
    { name: "Earth Diameter", size: 12742000, description: "Our home planet", color: "#4169e1", category: "planet" },
    { name: "Jupiter Diameter", size: 139820000, description: "Largest planet in solar system", color: "#daa520", category: "planet" },
    { name: "Sun Diameter", size: 1392700000, description: "Our star", color: "#ffff00", category: "star" },
    { name: "Solar System", size: 2.87e13, description: "Diameter including Kuiper Belt", color: "#808080", category: "space" },
    { name: "Light Year", size: 9.461e15, description: "Distance light travels in one year", color: "#ffffff", category: "space" },
    { name: "Milky Way Galaxy", size: 1e21, description: "Our galaxy, containing billions of stars", color: "#e0e0ff", category: "space" },
    { name: "Observable Universe", size: 8.8e26, description: "The limit of what we can observe", color: "#000020", category: "space" }
];
