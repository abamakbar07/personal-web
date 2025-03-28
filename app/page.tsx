import { BlogPosts } from 'app/components/posts';
import { getContent } from 'app/utils/content';

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        {getContent('home', 'title')}
      </h1>
      <p className="mb-4">
        {getContent('home', 'introduction')}
      </p>
      <p className="mb-4">
        {getContent('home', 'current')}
      </p>
      <p className="mb-4">
        {getContent('home', 'passion')}
      </p>
      <div className="my-8">
        <h3 className="mb-8 text-2xl font-semibold tracking-tighter">
          Blogposts
        </h3>
        <BlogPosts limit={5} />
      </div>
    </section>
  );
}
