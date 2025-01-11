import { BlogPosts } from 'app/components/posts';

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        Muhamad Akbar Afriansyah
      </h1>
      <p className="mb-4">
        {`Hey there! I'm Akbar, a tech enthusiast and SAP Admin based in Bogor, Indonesia. I geek out on all things back-end development, cloud tech, and data analysis. With a solid background in Computer Systems Networking and Telecommunications, I've got the skills to build cool stuff—from full-stack web apps to seamless integrations.`}
      </p>
      <p className="mb-4">
        {`Right now, I'm making waves at PT DSV Solutions Indonesia in the logistics game while leveling up through the Supervisor Development Program (SDP). I code with Python, JavaScript, and mess around with SAP Inventory Management, always looking for ways to innovate and stay ahead.`}
      </p>
      <p className="mb-4">
        {`When I'm not working, you’ll find me building social media apps with NextJS, dreaming up creative projects, or diving into philosophical rabbit holes. I'm all about creating tech that makes life better—and having a little fun while doing it!`}
      </p>
      <div className="my-8">
        <h3 className="mb-8 text-2xl font-semibold tracking-tighter">
          Blogposts
        </h3>
        <BlogPosts />
      </div>
    </section>
  );
}
