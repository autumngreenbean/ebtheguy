/* Welcome to blog.js! 
This module is responsible for handing all blog-related wishes and desires for the website. 
blog.js is called when the user wants to spawn or close blog items. 

Close buttons on blog windows have a data-id attached to them, which will pass to the function to symbolize closing ceremony.

The function:
- Closes blog windows on load 
- fetches blog content from an external Google Sheets spreadsheet
- Displays blog content in a menu display and full-display text editor
- Creates and displays a loading animation while blog content loads 

~ signalkitten <3
*/

let blogInitialized = false;
let loadedContent = false;

export function blog(dataId) {
  const allBlogs = document.querySelectorAll('#blog');
  if (!blogInitialized) {
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
    windowToClose.style.display = 'none';
  } else {
  }
  const postsContainer = document.getElementById('blog-item-container');

  let dotIntervalStarted = false;

  function startLoadingAnimation() {
    if (dotIntervalStarted) return;
    dotIntervalStarted = true;

    let dotCount = 0;
    const interval = setInterval(() => {
      const dots = document.getElementById('dots');
      if (!dots) {
        clearInterval(interval);
        return;
      }
      dotCount = (dotCount + 1) % 4;
      dots.textContent = '.'.repeat(dotCount);
    }, 500);
  }
  startLoadingAnimation();

  const loadingElement = document.getElementById('loading-animation');
  const loadingInterval = startLoadingAnimation();

  fetch('https://script.google.com/macros/s/AKfycbzFVHWMBNfvmtr8D07lJoZ-PpPo80O8x89jWX2iU6jf1Rz4znaEMEYNEEEPBcDLSJ8-/exec')

    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })

    .then(posts => {
      if (!loadedContent) {
        clearInterval(loadingInterval);
        loadingElement.remove();
      }

      if (!loadedContent) {
        posts.forEach(post => {
          const { title, body, month, year, date } = post;
          const blogItem = document.createElement('div');
          blogItem.id = 'blog-item';

          blogItem.innerHTML = `
          <img src="icons/notepad.png" alt="" style="padding-top: 1px; width:20px; height: 20px; background-color: transparent; padding-right: 2px;">
          <div id="blog-item-text">${title} - ${year}/${month}/${date}</div>
        `;

          blogItem.addEventListener('click', () => {
            loadBlogContent(post);
          });

          postsContainer.appendChild(blogItem);
          loadedContent = true;
        });
      }
    })
}

function loadBlogContent(post) {
  const textContainer = document.querySelector('[data-id="blogcontent"]');
  if (textContainer) {
    textContainer.innerText = post.body || "No content found.";
  } else {
    //error
  }
}

