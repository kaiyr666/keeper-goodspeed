export { default } from 'next-auth/middleware';
export const config = {
  matcher: ['/dashboard/:path*', '/upload/:path*', '/assets/:path*', '/my-submissions/:path*'],
};
