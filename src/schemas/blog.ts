import { z } from 'astro:content';

export const blogSchema = z.object({
  title: z.string(),
  description: z.string(),
  pubDate: z.coerce.date(),
  category: z.enum(['htb', 'lang', 'misc', 'daily-alpacahack']),
  tags: z.array(z.string()),
  difficulty: z.string().optional(),
  draft: z.boolean().default(false),
});

export type BlogFrontmatter = z.infer<typeof blogSchema>;
