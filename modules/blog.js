/* Welcome to blog.js! 
This module is responsible for handing all blog-related wishes and desires for the website. 
blog.js is called when the user wants to spawn or close blog items. 

Close buttons on blog windows have a data-id attached to them, which will pass to the function to symbolize closing ceremony.

The function:
- Closes blog windows on load 
- fetches blog content from an external Google Sheets spreadsheet
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
          <div id="blog-item-text">${title}</div>
        `;

          blogItem.addEventListener('click', () => {
            loadBlogContent(post);
            document.querySelector('#blog #header .window-title').innerHTML = `<img src="icons/search-file.png" alt="" style="padding-top: 1px; width:20px; height: 20px; background-color: transparent; padding-right: 2px;">&nbsp;${year}/${month}/${date}`;
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

  }
}

export function blogPost() { 
  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = now.getFullYear();
  const currentDate = String(now.getDate()).padStart(2, '0');
  const currentHour = String(now.getHours()).padStart(2, '0');  
  const currentMinute = String(now.getMinutes()).padStart(2, '0'); 


  const currentTime = `${currentHour}:${currentMinute}`;

  document.getElementById('time-data').innerHTML = `${currentYear}-${currentMonth}-${currentDate}`;

  document.getElementById('form-content').addEventListener('submit', async function (e) {
    e.preventDefault();

    // Get the current date


    // Gather form data
    const formData = new FormData(this);
    const data = {
        title: formData.get('title'),
        year: currentYear,
        month: currentMonth,
        date: currentDate,
        time: currentTime,
        body: formData.get('message')
    };

    
    console.log("Form Data:", data);  

    let dotIntervalStarted = false;
    const loadingElement = document.getElementById('submit-animation');

    function startLoadingAnimation() {
        
        // Make the element visible
        loadingElement.style.display = 'block';
    
        if (dotIntervalStarted) return;
        dotIntervalStarted = true;
    
        let dotCount = 0;
        const interval = setInterval(() => {
            const dots = document.getElementById('dot');
            if (!dots) {
                clearInterval(interval);
                return;
            }
            dotCount = (dotCount + 1) % 4;
            dots.textContent = '.'.repeat(dotCount);
        }, 500);
    
        loadingElement.innerHTML = 'Submitting content <span id="dot" style="all: inherit; display: inline; "></span>';
      }
    
    startLoadingAnimation();
    
  
    try {
        const response = await fetch('https://script.google.com/macros/s/AKfycbz6g8NIBQ0FWeOnl6WJ4mMsOhcFPT-rbpSqCZjIbUG75B7N7VS5EH1DK8U7alvjFUcL/exec', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(data),
        });
        loadingElement.innerHTML = 'Done!';

        const result = await response.text();  
        console.log("Response from server:", result);  
    } catch (error) {
        console.error("Error submitting form:", error);  
    }
  });
}
