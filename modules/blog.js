let blogInitialized = false;

export function blog(dataId) {
    const allBlogs = document.querySelectorAll('#blog');

    if (!blogInitialized) {
        console.log("First call: hiding all visible #blog elements...");
        allBlogs.forEach(el => {
            el.style.display = 'none';
        });
        blogInitialized = true;
        return; 
    }

    if (!dataId) {
        allBlogs.forEach(el => {
            el.style.display = '';
        });
    }

    const windowToClose = document.querySelector(`#blog[data-id="${dataId}"]`);
    if (windowToClose) {
        console.log(`Hiding #blog[data-id="${dataId}"]`);
        windowToClose.style.display = 'none';
    } else {
        console.warn(`No #blog[data-id="${dataId}"] found`);
    }
    
        console.log("blog.js: 'I am called!'");
        const postsContainer = document.getElementById('blog-item-container');

       // Animate the loading dots
let dotInterval;
function startLoadingAnimation() {
  const dots = document.getElementById('dots');
  let dotCount = 0;
  return setInterval(() => {
    dotCount = (dotCount + 1) % 4;
    dots.textContent = '.'.repeat(dotCount);
  }, 500);
}


// Stop and remove the loading animation
function stopAndRemoveLoadingAnimation() {
  clearInterval(dotInterval);
  const loading = document.getElementById('loading-animation');
  if (loading) {
    loading.remove();
  }
}

// Start the animation right away
startLoadingAnimation();

// Fetch blog posts
const loadingElement = document.getElementById('loading-animation');
const loadingInterval = startLoadingAnimation();

fetch('https://script.google.com/macros/s/AKfycbzFVHWMBNfvmtr8D07lJoZ-PpPo80O8x89jWX2iU6jf1Rz4znaEMEYNEEEPBcDLSJ8-/exec')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();  // Parse JSON data
  })
  .then(posts => {
    console.log('Fetched posts:', posts);

    // Stop animation and remove loader
    clearInterval(loadingInterval);
    loadingElement.remove();

    posts.forEach(post => {
      const { title, body, month, year, date } = post;

      const blogItem = document.createElement('div');
      blogItem.id = 'blog-item'; // ⚠ multiple elements with the same ID
      blogItem.innerHTML = `
        <img src="icons/notepad.png" alt="" style="padding-top: 1px; width:20px; height: 20px; background-color: transparent; padding-right: 2px;">
        <div id="blog-item-text">${title} - ${year}/${month}/${date}</div>
      `;


    
      blogItem.addEventListener('click', () => {
        loadBlogContent(post);
      });

      postsContainer.appendChild(blogItem);
    });
  })
  .catch(error => {
    clearInterval(loadingInterval);
    loadingElement.textContent = 'Failed to load posts.';
    console.error('Error fetching data:', error);
  });

}

function loadBlogContent(post) {
    console.log("Loading blog content:", post);
  
    const textContainer = document.querySelector('[data-id="blogcontent"]');
    if (textContainer) {
      textContainer.innerText = post.body || "No content found.";
    } else {
      console.warn('No element with data-id="blogcontent" found.');
    }
  }
  
