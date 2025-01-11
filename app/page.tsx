import { BlogPosts } from 'app/components/posts';

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Muhamad Akbar Afriansyah
      </h1>
      <p className="mb-4">
        {`Hey there! I'm Akbar, a tech-savvy SAP Admin and back-end dev from Bogor. With skills in Python, JavaScript, and SAP Inventory Management, I'm all about creating cool, functional apps and diving into data.`}
      </p>
      <p className="mb-4">
        {`Currently leveling up at PT DSV Solutions Indonesia and exploring new ways tech can make life easier. From building social media apps to dabbling in AI, I love mixing creativity with code.`}
      </p>
      <div className="my-8">
        <BlogPosts />
      </div>
    </section>
  );
}
