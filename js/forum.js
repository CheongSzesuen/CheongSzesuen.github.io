// 模拟帖子数据
const posts = [
    { title: '帖子标题1', content: '帖子内容1' },
    { title: '帖子标题2', content: '帖子内容2' },
    { title: '帖子标题3', content: '帖子内容3' },
  ];
  
  // 渲染帖子列表
  const postList = document.getElementById('postList');
  posts.forEach(post => {
    const postElement = document.createElement('div');
    postElement.classList.add('post');
    postElement.innerHTML = `
      <h3>${post.title}</h3>
      <p>${post.content}</p>
    `;
    postList.appendChild(postElement);
  });
  