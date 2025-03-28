import Link from 'next/link'
import { formatDate, getBlogPosts } from 'app/blog/utils'

export function BlogPosts({ limit, page = 1, postsPerPage = 10 }) {
  let allBlogs = getBlogPosts()
  const totalPosts = allBlogs.length
  const totalPages = Math.ceil(totalPosts / postsPerPage)
  
  // Sort posts by date (newest first)
  const sortedBlogs = allBlogs.sort((a, b) => {
    if (new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)) {
      return -1
    }
    return 1
  })
  
  // If limit is provided, just show that many posts
  // Otherwise, apply pagination
  const displayedBlogs = limit 
    ? sortedBlogs.slice(0, limit)
    : sortedBlogs.slice((page - 1) * postsPerPage, page * postsPerPage)

  return (
    <div>
      {displayedBlogs.map((post) => (
        <Link
          key={post.slug}
          className="flex flex-col space-y-1 mb-4"
          href={`/blog/${post.slug}`}
        >
          <div className="w-full flex flex-col md:flex-row space-x-0 md:space-x-2">
            <p className="text-neutral-600 dark:text-neutral-400 w-[100px] tabular-nums">
              {formatDate(post.metadata.publishedAt, false)}
            </p>
            <p className="text-neutral-900 dark:text-neutral-100 tracking-tight">
              {post.metadata.title}
            </p>
          </div>
        </Link>
      ))}
      
      {!limit && totalPages > 1 && (
        <div className="flex justify-center mt-8 space-x-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
            <Link 
              key={pageNum} 
              href={`/blog?page=${pageNum}`}
              className={`px-3 py-1 rounded ${page === pageNum ? 'bg-neutral-200 dark:bg-neutral-800' : 'hover:bg-neutral-100 dark:hover:bg-neutral-900'}`}
            >
              {pageNum}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
