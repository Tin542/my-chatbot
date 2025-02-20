export const metadata = {
  title: 'My Chatbot',
  description: 'Chatbot using Next.js',
  keywords: 'chatbot, nextjs',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
