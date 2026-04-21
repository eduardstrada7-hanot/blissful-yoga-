export const site = {
  name: "Blissful Butterfly Yoga",
  tagline: "Trauma-informed yoga therapy & accessible online classes.",
  url: "https://blissfulbutterflyyoga.com",
  teacher: {
    name: "Veronica Carpenter",
    credentials: "BA, C-IAYT, E-RYT 500",
    location: "Audubon, NJ",
    email: "veronica@blissfulbutterflyyoga.com",
    hours: "2,000+ teaching hours",
  },
  social: {
    facebook: "https://www.facebook.com/BlissfulButterflyYoga",
    instagram: "https://instagram.com/blissfulbutterflyyoga",
    linkedin: "https://www.linkedin.com/in/veronica-carpenter-1980/",
    youtube: "https://www.youtube.com/channel/UCYbDbaAc1tHfPldC4uy-TWQ",
    spotify: "https://open.spotify.com/user/12132290196",
    tiktok: "https://www.tiktok.com/@blissfulbutterflyyoga",
  },
  nav: [
    {
      label: "Offerings",
      href: "/offerings",
      children: [
        { label: "Livestream Classes", href: "/offerings/classes" },
        { label: "Yoga Therapy", href: "/offerings/yoga-therapy" },
        { label: "Soulhood Circles", href: "/offerings/soulhood" },
        { label: "Bad Romance Recovery", href: "/offerings/bad-romance" },
        { label: "Mindful Child Support", href: "/offerings/children" },
        { label: "Inner Child Yoga", href: "/offerings/inner-child" },
        { label: "Ecstatic Dance", href: "/offerings/ecstatic-dance" },
        { label: "Special Events", href: "/offerings/events" },
      ],
    },
    { label: "About", href: "/about" },
    {
      label: "Resources",
      href: "/free",
      children: [
        { label: "Yoga On Demand", href: "/on-demand" },
        { label: "Free Videos & Mini-Course", href: "/free" },
        { label: "Testimonials", href: "/testimonials" },
      ],
    },
  ],
};
