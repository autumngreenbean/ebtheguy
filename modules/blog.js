/* Welcome to blog.js! 
This module is responsible for handing all blog-related wishes and desires for the website. 
blog.js is called when the user wants to spawn or close blog items. 

Close buttons on blog windows have a data-id attached to them, which will pass to the function to symbolize closing ceremony.

The function:
- Closes blog windows on load 
- fetches blog content from static JSON file (updated by Google Sheets)
- Displays blog content in a menu display and full-display text editor
- Creates and displays a loading animation while blog content loads 

~ <3
*/

import { makeDraggable } from './makeDraggable.js';

let blogInitialized = false;
let loadedContent = false;

export function blog(dataId) {
  const allBlogs = document.querySelectorAll('#blog');
  const blogForum = document.querySelectorAll('#blogpost');

  if (!blogInitialized) {
    allBlogs.forEach(el => {
      el.style.display = 'none';
    });
    blogForum.forEach(ol => {
      ol.style.display = 'none';
    });
    blogInitialized = true;
    return;
  }
  if (!dataId) {
    allBlogs.forEach(el => {
      el.style.display = '';
      // Clear conflicting positioning styles
      el.style.right = 'auto';
      el.style.bottom = 'auto';
    });
    const blogWindows = document.querySelectorAll('#blog');
    blogWindows.forEach(blo => {
    const blogger = blo.querySelector('#header');
    if (blogger) {
        makeDraggable(blo, blogger);
    } else {
        console.warn('No header found for draggable window:', blo);
    }
});

    // Mobile optimization: position windows appropriately on open
    if (window.innerWidth <= 768) {
      const blogContentWindow = document.querySelector('#blog[data-id="blog1"]');
      const blogMenuWindow = document.querySelector('#blog[data-id="blog2"]');
      
      if (blogContentWindow) {
        blogContentWindow.style.display = 'none'; // Hide content until item clicked
        blogContentWindow.style.left = '50%';
        blogContentWindow.style.top = '45%';
        blogContentWindow.style.transform = 'translate(-50%, -50%)';
      }
      
      if (blogMenuWindow) {
        blogMenuWindow.style.top = '10px';
        blogMenuWindow.style.left = '50%';
        blogMenuWindow.style.transform = 'translateX(-50%)';
      }
    } else {
      // Desktop positioning
      const blogContentWindow = document.querySelector('#blog[data-id="blog1"]');
      const blogMenuWindow = document.querySelector('#blog[data-id="blog2"]');
      
      if (blogContentWindow && !blogContentWindow.style.left) {
        blogContentWindow.style.left = '300px';
        blogContentWindow.style.top = '100px';
        blogContentWindow.style.transform = 'none';
      }
      
      if (blogMenuWindow && !blogMenuWindow.style.left) {
        blogMenuWindow.style.left = '150px';
        blogMenuWindow.style.top = '150px';
        blogMenuWindow.style.transform = 'none';
      }
    }

  }
  else if (dataId) {
    let windowToClose;
    console.log('windowtoClose=' + dataId)
    if (dataId == 'blog3') {
       windowToClose = document.querySelector(`#blogpost[data-id="${dataId}"]`);
    } else {
       windowToClose = document.querySelector(`#blog[data-id="${dataId}"]`);  
    }
    if (windowToClose) {
    windowToClose.style.display = 'none';
    } 
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

  // Fetch blog posts from static JSON via data-service
  window.dataService.getBlogData()
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
          <div id="blog-item-text">${title}</div>
        `;

          blogItem.addEventListener('click', () => {
            loadBlogContent(post);
            document.querySelector('#blog #header .window-title').innerHTML = `<img src="icons/search-file.png" alt="" style="padding-top: 1px; width:20px; height: 20px; background-color: transparent; padding-right: 2px;">&nbsp;${year}/${month}/${date}`;
            
            // Mobile optimization: Position blog content window to overlay but keep menu visible
            if (window.innerWidth <= 768) {
              const blogContentWindow = document.querySelector('#blog[data-id="blog1"]');
              const blogMenuWindow = document.querySelector('#blog[data-id="blog2"]');
              
              if (blogContentWindow && blogMenuWindow) {
                // Show content window and clear conflicting styles
                blogContentWindow.style.display = '';
                blogContentWindow.style.right = 'auto';
                blogContentWindow.style.bottom = 'auto';
                
                // Get menu header height
                const menuHeader = blogMenuWindow.querySelector('#header');
                const headerHeight = menuHeader ? menuHeader.offsetHeight : 25;
                
                // Position content window slightly below menu header
                blogContentWindow.style.top = `${headerHeight + 10}px`;
                blogContentWindow.style.left = '50%';
                blogContentWindow.style.transform = 'translateX(-50%)';
                blogContentWindow.style.zIndex = '99';
                
                // Ensure menu window stays accessible
                blogMenuWindow.style.right = 'auto';
                blogMenuWindow.style.bottom = 'auto';
                blogMenuWindow.style.top = '10px';
                blogMenuWindow.style.left = '50%';
                blogMenuWindow.style.transform = 'translateX(-50%)';
                blogMenuWindow.style.zIndex = '98';
              }
            } else {
              // Desktop: just show the window normally
              const blogContentWindow = document.querySelector('#blog[data-id="blog1"]');
              if (blogContentWindow) {
                blogContentWindow.style.display = '';
                blogContentWindow.style.right = 'auto';
                blogContentWindow.style.bottom = 'auto';
              }
            }
          });

          postsContainer.appendChild(blogItem);
          loadedContent = true;
        });
      }
    })
    .catch(error => {
      console.error('Error loading blog posts:', error);
      if (!loadedContent) {
        clearInterval(loadingInterval);
        loadingElement.innerHTML = 'Failed to load blog posts.';
      }
    });
}

function loadBlogContent(post) {
  const textContainer = document.querySelector('[data-id="blogcontent"]');
  if (textContainer) {
    textContainer.innerText = post.body || "No content found.";
  } else {

  }
}

// NOTE: blogPost() function for direct blog posting has been disabled.
// Blog posts are now managed through Google Sheets, which automatically
// updates the content.json file via GitHub API.
// To add new blog posts, edit the "Blog" sheet in your Google Sheets document.
export function blogPost() { 
  console.log('Blog posting is now managed through Google Sheets.');
  console.log('Please edit the Blog sheet in your Google Sheets document to add new posts.');
  
  // Display message to user if they try to use the old posting interface
  const loadingElement = document.getElementById('submit-animation');
  if (loadingElement) {
    loadingElement.style.display = 'block';
    loadingElement.innerHTML = 'Blog posting is now managed through Google Sheets. Please edit your sheet to add posts.';
  }
}
