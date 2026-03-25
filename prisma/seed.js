const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

const slugify = (input) =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

async function main() {
  const passwordHash = await bcrypt.hash("stash-demo", 10)

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@stash.run" },
    update: {},
    create: {
      name: "Stash Demo",
      email: "demo@stash.run",
      handle: "stash-demo",
      passwordHash,
    },
  })

  const categories = [
    { name: "SaaS", description: "Polished flows for subscription products." },
    { name: "Dashboard", description: "Clarity-first data visualization kits." },
    { name: "Landing Page", description: "Editorial storytelling with bold CTAs." },
    { name: "Mobile App", description: "Compact layouts and silky interactions." },
    { name: "E-commerce", description: "Conversion-ready commerce templates." },
    { name: "Game UI", description: "Playful HUDs and immersive menus." },
    { name: "AI Tool", description: "Future-ready AI experiences." },
  ]

  const categoryRecords = {}
  for (const category of categories) {
    const slug = slugify(category.name)
    categoryRecords[slug] = await prisma.category.upsert({
      where: { slug },
      update: { description: category.description, name: category.name },
      create: { name: category.name, slug, description: category.description },
    })
  }

  const designs = [
    {
      title: "Nimbus SaaS Onboarding",
      description: "A calm, high-contrast onboarding flow that balances clarity and polish.",
      category: "saas",
      tags: ["SaaS", "Onboarding", "Minimal"],
      content: "# RESOURCE.md\n\n## Purpose\nCreate a premium onboarding flow for a modern SaaS product. The user should feel confident, guided, and energized.\n\n## Visual Language\n- Large editorial typography\n- Neutral background with soft gradients\n- Rounded cards, glassy overlays\n- Accent colors used sparingly for focus\n\n## Layout Structure\n1. Hero headline with concise value proposition\n2. Step-by-step onboarding cards (3 steps)\n3. Feature grid with short labels\n4. Testimonial band with avatar stack\n",
      images: [
        "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a",
        "https://images.unsplash.com/photo-1487014679447-9f8336841d58",
      ],
    },
    {
      title: "Aurora Analytics Dashboard",
      description: "A data-dense dashboard with airy spacing and intuitive highlights.",
      category: "dashboard",
      tags: ["Dashboard", "Charts", "Enterprise"],
      content: "# RESOURCE.md\n\n## Purpose\nCreate a data-rich analytics dashboard that feels light and approachable.\n\n## Visual Language\n- Crisp grid layout\n- Cool blue accents\n- Clear hierarchy between cards\n\n## Layout Structure\n1. Top KPI row\n2. Two-column chart grid\n3. Insights sidebar\n",
      images: [
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
      ],
    },
    {
      title: "Petal Mobile Checkout",
      description: "Smooth commerce flow with friendly microcopy and soft gradients.",
      category: "mobile-app",
      tags: ["Mobile App", "E-commerce", "Fintech"],
      content: "# RESOURCE.md\n\n## Purpose\nDesign a mobile checkout flow that feels quick and reassuring.\n\n## Visual Language\n- Warm gradients\n- Rounded cards\n- Microcopy for reassurance\n",
      images: [
        "https://images.unsplash.com/photo-1498050108023-c5249f4df085",
      ],
    },
  ]

  for (const design of designs) {
    const slug = slugify(design.title)
    const existing = await prisma.design.findUnique({ where: { slug } })
    if (existing) continue

    await prisma.design.create({
      data: {
        title: design.title,
        slug,
        description: design.description,
        content: design.content,
        authorId: demoUser.id,
        categoryId: categoryRecords[design.category]?.id,
        tags: {
          create: design.tags.map((tag) => ({
            tag: {
              connectOrCreate: {
                where: { slug: slugify(tag) },
                create: { name: tag, slug: slugify(tag) },
              },
            },
          })),
        },
        images: {
          create: design.images.map((url, index) => ({
            url,
            order: index,
          })),
        },
      },
    })
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
