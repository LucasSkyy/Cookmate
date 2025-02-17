const API_KEY = '3cd74aa34a7e425ba362a4d2b32ae955';
const recipeGrid = document.getElementById('recipeGrid');
const searchButton = document.getElementById('searchButton');
const searchInput = document.getElementById('searchInput');
const loadingSpinner = document.getElementById('loadingSpinner');
const cuisineSelect = document.getElementById('cuisine');
const dietSelect = document.getElementById('diet');
const recipeDetail = document.getElementById('recipeDetail');
const closeDetail = document.getElementById('closeDetail');

document.addEventListener('DOMContentLoaded', () => {
  // Check for recipe ID in URL
  const urlParams = new URLSearchParams(window.location.search);
  const recipeId = urlParams.get('recipe');

  if (recipeId) {
    // Show the recipe detail immediately
    showRecipeDetail(recipeId);
  } else {
    // Load initial recipes as normal
    searchRecipes();
  }
});

async function searchRecipes() {
  try {
    loadingSpinner.classList.remove('hidden');
    recipeGrid.innerHTML = '';

    const query = searchInput.value;
    const cuisine = cuisineSelect.value;
    const diet = dietSelect.value;

    const params = new URLSearchParams({
      apiKey: API_KEY,
      query: query,
      number: 9,
      ...(cuisine && { cuisine }),
      ...(diet && { diet })
    });

    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?${params}`);
    const data = await response.json();

    data.results.forEach(recipe => {
      const recipeCard = `
        <div class="recipe-card p-6 bg-white/40 backdrop-blur-md rounded-xl shadow-lg transition-transform duration-300 hover:scale-[1.02]" onclick="showRecipeDetail(${recipe.id})">
          <img src="${recipe.image}" alt="${recipe.title}" class="w-full h-48 object-cover rounded-xl mb-4">
          <h3 class="text-xl font-bold mb-2">${recipe.title}</h3>
          <div class="flex justify-between items-center">
            <a href="assistant.html" 
              class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 inline-block">
              Get Recipe Help
            </a>
          </div>
        </div>
      `;
      recipeGrid.innerHTML += recipeCard;
    });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    recipeGrid.innerHTML = '<p class="text-red-500">Error fetching recipes. Please try again.</p>';
  } finally {
    loadingSpinner.classList.add('hidden');
  }
}

async function showRecipeDetail(recipeId) {
  try {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`);
    const recipe = await response.json();

    document.getElementById('recipeImage').src = recipe.image;
    document.getElementById('recipeTitle').textContent = recipe.title;
    document.getElementById('prepTime').textContent = `Prep time: ${recipe.readyInMinutes} minutes`;
    document.getElementById('servings').textContent = `Servings: ${recipe.servings}`;

    // Update ingredients list
    document.getElementById('ingredients').innerHTML = recipe.extendedIngredients.map(ingredient => `
      <li class="ingredient-item"><i class="fas fa-check-circle text-green-500"></i> ${ingredient.original}</li>
    `).join('');

    // Parse and format instructions
    const instructionsContainer = document.getElementById('instructions');
    if (recipe.analyzedInstructions && recipe.analyzedInstructions.length > 0) {
      const steps = recipe.analyzedInstructions[0].steps;
      instructionsContainer.innerHTML = `
        <ol class="recipe-instructions">
          ${steps.map(step => `<li>${step.step}</li>`).join('')}
        </ol>
      `;
    } else if (recipe.instructions) {
      const plainInstructions = recipe.instructions
        .replace(/<ol>/g, '')
        .replace(/<\/ol>/g, '')
        .replace(/<li>/g, '')
        .replace(/<\/li>/g, '')
        .split(/\d+\.\s+/)
        .filter(step => step.trim())
        .map((step, index) => `<li>${step.trim()}</li>`)
        .join('');

      instructionsContainer.innerHTML = `
        <ol class="recipe-instructions">
          ${plainInstructions}
        </ol>
      `;
    } else {
      instructionsContainer.textContent = 'No instructions available.';
    }

    recipeDetail.classList.add('open');
  } catch (error) {
    console.error('Error fetching recipe details:', error);
    alert('Failed to load recipe details. Please try again.');
  }
}

closeDetail.addEventListener('click', () => {
  recipeDetail.classList.remove('open');
});

searchButton.addEventListener('click', searchRecipes);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') searchRecipes();
}); 