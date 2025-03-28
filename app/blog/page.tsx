
import { BlogPosts } from 'app/components/posts'
import { getContent } from 'app/utils/content'
import { useSearchParams } from 'next/navigation'

export const metadata = {
  title: getContent('blog', 'title'),
  description: getContent('blog', 'description'),
}

export default function Page({ searchParams }) {
  const currentPage = Number(searchParams.page || '1')

  return (
    <section>
      <h1 className="font-semibold text-2xl mb-8 tracking-tighter">
        {getContent('blog', 'title')}
      </h1>
      <BlogPosts page={currentPage} limit={undefined} />
    </section>
  )
}
