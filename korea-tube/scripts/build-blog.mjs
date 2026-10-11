// 블로그 글 템플릿을 바꾼 뒤 기존 글을 모두 다시 만들 때: node scripts/build-blog.mjs
import { rebuildBlog } from "./lib.mjs";
console.log(`블로그 글 ${rebuildBlog()}편을 다시 만들었어요.`);
