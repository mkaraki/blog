import { defineConfig } from "tinacms";

// Your hosting provider likely exposes this as an environment variable
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,

  // Get this from tina.io
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID,
  // Get this from tina.io
  token: process.env.TINA_TOKEN,

  build: {
    outputFolder: "admin",
    publicFolder: "public",
  },
  // Uncomment to allow cross-origin requests from non-localhost origins
  // during local development (e.g. GitHub Codespaces, Gitpod, Docker).
  // Use 'private' to allow all private-network IPs (WSL2, Docker, etc.)
  // server: {
  //   allowedOrigins: ['https://your-codespace.github.dev'],
  // },
  ui: {
    previewUrl: (context) => { 
      return {
        url: `https://${context.branch}.blog-b95.pages.dev`,
      }
    }
  },
  media: {
    tina: {
      mediaRoot: "media",
      publicFolder: "public",
    },
  },
  // See docs on content modeling for more info on how to setup new content models: https://tina.io/docs/r/content-modelling-collections/
  schema: {
    collections: [
      {
        name: "blogPost",
        label: "Blog Posts",
        path: "src/content/blog",
        format: 'md',
        defaultItem: () => {
          const now = new Date();
          return {
            date: now.toISOString(),
            author: "mkaraki",
            slug: `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-`,
          };
        },
        ui: {
          allowedActions: {
            create: true,
            delete: true,
            createNestedFolder: false,
          },
          filename: {
            showFirst: true,
            description: "Filename must be in the format YYYYMMDD-slug.md. Please match with the date and slug fields.",
            readonly: true,
            slugify: (values) => {
              if (values.slug) {
                return values.slug;
              } else {
                const now = new Date();
                const safeTitle = values.title.replace(' ', '-').toLowerCase();
                return `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}-${safeTitle}`;
              }
            },
          },
        },
        fields: [
          {
            type: "string",
            name: "slug",
            label: "Slug",
            required: true,
            description: "This become filename. Format: YYYYMMDD-slug. Must match with the date and title fields.",
          },
          {
            type: "string",
            name: "title",
            label: "Title",
            isTitle: true,
            required: true,
          },
          {
            type: "datetime",
            name: "date",
            label: "Date",
            required: true,
            ui: {
              dateFormat: 'YYYY-MM-DD',
              timeFormat: "HH:mm",
            },
          },
          {
            type: "datetime",
            name: "updatedDate",
            label: "Updated Date",
            required: false,
            ui: {
              dateFormat: 'YYYY-MM-DD',
              timeFormat: "HH:mm",
            },
          },
          {
            type: "string",
            name: "author",
            label: "Author",
            required: true,
            options: [
              'mkaraki'
            ],
          },
          {
            type: "string",
            name: "tags",
            label: "Tags",
            list: true,
          },
          {
            type: "rich-text",
            name: "body",
            label: "Body",
            isBody: true,
          },
        ],
      },
    ],
  },
});
