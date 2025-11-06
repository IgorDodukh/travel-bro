import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { Metadata } from 'next';

type Post = {
    slug: string;
    title: string;
    date: string;
    readingMinutes: number;
    cover?: string;
    content: string;
    excerpt?: string;
    tags?: string[];
};

const POSTS: Record<string, Post> = {
    'ai-vs-human-travel-planning': {
        slug: 'ai-vs-human-travel-planning',
        title: 'AI vs Human Travel Planning — The Real Test',
        date: '2025-10-15',
        readingMinutes: 4,
        cover: '/assets/blog-covers/ai-vs-human.jpg',
        content: `

<h2>🧭 The Old Way of Planning Trips</h2>
<p>Let’s be honest — planning a trip can sometimes feel like a part-time job.
You open <strong>Google Maps</strong> to explore spots, <strong>Booking.com</strong> to check hotels, a dozen <strong>travel blogs</strong> for hidden gems, and then a <strong>spreadsheet</strong> to track everything.
After a few hours, you’ve got 20 tabs open, your brain’s melting, and you’re still unsure if your route makes sense.</p>

<p>Traditional, manual trip planning gives you control, sure — but it also eats time.
And unless you’re a travel expert, chances are high you’ll miss some local gems or underestimate travel times between stops.</p>

<p>That’s where <strong>AI travel planners</strong> are starting to quietly revolutionize how people explore the world.</p>
<hr />
<h2>⚙️ How AI Travel Planning Actually Works</h2>
<p>Unlike humans, an <strong>AI trip planner</strong> doesn’t just collect information — it understands your <em>intent</em>.
When you type something like <em>“3-day road trip through northern Portugal with scenic views and good food”</em>, AI parses it into:</p>

<ul>
  <li>✅ Travel duration</li>
  <li>✅ Location and region</li>
  <li>✅ Type of attractions (scenic, food)</li>
  <li>✅ Preferred pace</li>
  <li>✅ Budget range</li>
</ul>

<p>Then, within seconds, it builds a <strong>personalized daily itinerary</strong> — complete with logical routes, approximate visiting times, and even restaurant stops in between.</p>

<p>The result? Something that used to take hours now happens in <strong>under a minute</strong> — and it’s surprisingly good.</p>
<hr />
<h2>💡 The Real Test: AI vs Human</h2>
<p>Let’s take a simple challenge:</p>

<blockquote>
  <p>Plan a 4-day trip in Tuscany with a mix of wine tasting, small towns, and countryside views.</p>
</blockquote>
<p>A <strong>human travel enthusiast</strong> might:</p>
<ul>
  <li>Research 10+ websites</li>
  <li>Create a Google Map</li>
  <li>Compare travel times</li>
  <li>Manually schedule activities</li>
</ul>

<p><strong>Time spent:</strong> ~3 hours<br />
<strong>Quality:</strong> High, but subjective.</p>

<p>Meanwhile, <strong>PlaPlan (AI Travel Planner)</strong>:</p>
<ul>
  <li>Analyzes top-rated places</li>
  <li>Balances travel distance &amp; time</li>
  <li>Suggests the best daily order</li>
  <li>Calculates total distance and estimated cost</li>
</ul>

<p><strong>Time spent:</strong> ~30 seconds<br />
<strong>Quality:</strong> Consistently optimized.</p>

<p><strong>Result:</strong> Humans still win on emotional “feel” — but AI wins on <strong>speed, structure, and optimization</strong>.
And when humans add their final personal touches to an AI-generated base, it becomes the best of both worlds.</p>
<hr />
<h2>✨ Why People Are Falling in Love with AI Travel Planners</h2>
<ul>
  <li><strong>Time Efficiency:</strong> You can go from idea to complete plan while drinking your morning coffee.</li>
  <li><strong>Personalization:</strong> The AI adapts based on your preferences — whether you love nature, food, or museums.</li>
  <li><strong>Smart Routing:</strong> No more jumping between distant locations or wasting hours driving in circles.</li>
  <li><strong>Budget Awareness:</strong> Many AI planners, like PlaPlan, show you the approximate costs upfront.</li>
  <li><strong>Continuous Updates:</strong> Plans evolve as new attractions appear or weather changes.</li>
</ul>

<p>It’s not about replacing your curiosity — it’s about <strong>enhancing it</strong>.</p>
<hr />
<h2>🗺️ When Humans Still Win</h2>
<p>There are still areas where human intuition shines:</p>
<ul>
  <li>Emotional experiences, like discovering a random café on a quiet street.</li>
  <li>Last-minute changes that depend on weather or mood.</li>
  <li>Personal advice from locals or past travelers.</li>
</ul>

<p>But AI doesn’t remove that magic — it <strong>frees you from logistics</strong>, so you can actually enjoy those spontaneous moments.</p>
<hr />
<h2>🚀 The Future of Travel Planning</h2>
<p>In the next few years, AI will likely become the <strong>default starting point</strong> for every trip.
Imagine having your <strong>travel companion</strong> that knows your favorite pace, suggests ideal visiting hours, and updates your plan in real-time as you move.</p>

<p>That’s not science fiction — that’s <strong>PlaPlan</strong>, already doing it today.</p>

<p>You can build your first plan in under a minute, explore hidden gems, and even track your route — all from one app.</p>
<hr />
<h2>🧳 Final Thoughts</h2>
<p><strong>AI vs Human?</strong> It’s not a competition anymore.
The most beautiful trips will come from the <strong>collaboration</strong> between both — your creativity and AI’s precision.</p>

<p>So next time you dream of your next getaway…<br />
Let AI handle the details — and <strong>you handle the adventure.</strong></p>
<hr />
<h3>👉 Try PlaPlan today</h3>
<p>Plan your next trip with the world’s most intuitive AI travel planner.<br />
<a href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB" target="_blank" rel="noopener noreferrer">Download on the App Store</a></p>
`,
    },
    'hidden-gems-portugal': {
        slug: 'hidden-gems-portugal',
        title: '5 Hidden Gems in Portugal You’d Never Find on Google Maps',
        date: '2025-10-01',
        readingMinutes: 5,
        cover: '/assets/blog-covers/portugal-gems.jpg',
        content: `
<p>Portugal is full of postcard-perfect spots — Lisbon’s tram-filled streets, Porto’s wine cellars, and the golden beaches of the Algarve.  
But beyond the tourist trails lies a different kind of magic — <strong>untouched villages, secret beaches, and authentic local places</strong> you’ll never find in your typical Google Maps search.</p>

<p>Here are five hidden gems in Portugal that deserve a spot on your next itinerary — and a few reasons why they’re worth the detour.</p>

<hr />

<h2>1. Foz d’Égua — The Fairytale Village in the Mountains</h2>

<p>Tucked away in the <strong>Serra do Açor</strong> mountains near Piódão, Foz d’Égua looks like something out of a Tolkien novel.  
Two ancient stone bridges cross over crystal-clear streams, surrounded by slate houses and dense forest trails.  
You can swim in natural pools in summer or hike through the surrounding valleys in cooler months.</p>

<p><strong>Why it’s special:</strong> It’s a true hidden paradise with almost no crowds, even in high season.  
Bring your camera — this village is one of the most photogenic places in Portugal.</p>

<p><strong>Perfect for:</strong> Nature lovers, hikers, and anyone seeking a quiet mountain escape.</p>

<hr />

<h2>2. Praia da Ursa — The Wildest Beach Near Lisbon</h2>

<p>Just a few minutes from the famous <strong>Cabo da Roca</strong> (Europe’s westernmost point), Praia da Ursa is a secret slice of heaven that’s surprisingly close to Lisbon — but still unknown to most tourists.  
Getting there isn’t easy: it’s a steep 20-minute hike down the cliffs, but the reward is enormous — a raw, wild beach surrounded by massive rock formations and turquoise water.</p>

<p><strong>Why it’s special:</strong> No bars, no umbrellas, no crowds — just nature in its purest form.  
It’s one of those beaches where you feel completely disconnected from the world.</p>

<p><strong>Pro tip:</strong> Visit during sunset for one of the most spectacular views on the Portuguese coast.</p>

<hr />

<h2>3. Cacela Velha — The Timeless Algarve Village</h2>

<p>While most visitors head straight for Lagos or Albufeira, the tiny village of <strong>Cacela Velha</strong> in the eastern Algarve remains beautifully preserved.  
With whitewashed houses, cobblestone streets, and views over the Ria Formosa lagoon, it feels like stepping back in time.</p>

<p>From the hilltop, you can see sandbanks stretching endlessly into the ocean — and if you walk down, you’ll find quiet beaches where locals fish and gather clams.</p>

<p><strong>Why it’s special:</strong> It’s a rare glimpse of the Algarve before mass tourism — calm, authentic, and full of charm.</p>

<p><strong>Don’t miss:</strong> The local seafood restaurants serving freshly caught fish and amêijoas (clams).</p>

<hr />

<h2>4. Monsanto — The Village Built Into Giant Rocks</h2>

<p>Often called “<strong>the most Portuguese village in Portugal</strong>,” <strong>Monsanto</strong> is like nowhere else on Earth.  
Homes here are literally built <em>around</em> or <em>under</em> massive granite boulders — it’s an architectural marvel where nature and human creativity coexist.</p>

<p>Climb up to the old castle ruins for panoramic views over the countryside, and you’ll understand why it’s a UNESCO heritage site candidate.</p>

<p><strong>Why it’s special:</strong> It’s an open-air museum of Portuguese history and ingenuity — and still a living village with friendly locals.</p>

<p><strong>Best time to visit:</strong> Spring or autumn, when the landscape is green and the weather perfect for walking.</p>

<hr />

<h2>5. Talasnal — The Reborn Schist Village</h2>

<p>Hidden deep in the <strong>Lousã Mountains</strong>, Talasnal is one of Portugal’s beautifully restored schist villages.  
Abandoned decades ago, it’s now home to a handful of cozy guesthouses and craft shops, surrounded by forest trails and waterfalls.</p>

<p>Strolling through its narrow stone lanes feels like time travel — with the scent of wood smoke and rosemary in the air.</p>

<p><strong>Why it’s special:</strong> It’s a sustainable tourism success story — proof that rural villages can come back to life through love and care.</p>

<p><strong>What to do:</strong> Hike the trails connecting Talasnal with nearby villages like Candal and Casal Novo — or simply relax with local honey and cheese.</p>

<hr />

<h2>🌿 Final Thoughts — Discover the Portugal You’ve Never Seen</h2>

<p>Portugal’s beauty isn’t just in its famous landmarks — it’s in these <strong>hidden, human, and humble places</strong> that remind you what real travel feels like.  
AI can help you find and organize them — but the experience of <em>being there</em> will always be yours.</p>

<p>If you’re planning your next trip to Portugal, let <strong>PlaPlan</strong> uncover these gems for you.  
You’ll get a custom travel plan with the best routes, visiting times, and local tips — all in one app.</p>

<p><a href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB" target="_blank" rel="noopener noreferrer"><strong>→ Download PlaPlan on the App Store</strong></a></p>
        `,
    },
    'plan-weekend-trip-5-min': {
        slug: 'plan-weekend-trip-5-min',
        title: 'Plan Your Next Weekend Trip in 5 Minutes',
        date: '2025-10-28',
        readingMinutes: 5,
        cover: '/assets/blog-covers/weekend-trip.jpg',
        content: `
<p><strong>Short on time but craving a getaway?</strong> You don’t need a full day of research to plan an amazing weekend. With a few smart choices and a simple checklist, you can design a stress-free trip in under five minutes — transportation, lodging, and a packed-but-relaxing itinerary included. Read on for a fast, repeatable process that actually works.</p>

<h2>Why a 5-minute trip plan works</h2>
<p>Weekend trips aren’t about seeing everything — they’re about experiencing a few great things without burnout. Quick planning forces you to prioritize the essentials: travel time, a place to stay, one “must-see” activity, and a fallback option. This approach reduces decision fatigue and maximizes enjoyment.</p>

<h2>What you’ll need (30 seconds)</h2>
<ul>
  <li><strong>Destination radius:</strong> How far you’re willing to travel (e.g., 1–3 hours driving, short flight).</li>
  <li><strong>Trip style:</strong> Relaxed, adventure, food & wine, or culture.</li>
  <li><strong>Budget range:</strong> Low, medium, or splurge.</li>
  <li><strong>Travel dates:</strong> Weekend start and end (Fri–Sun or Sat–Mon).</li>
</ul>

<h2>The 5-minute planning formula (step-by-step)</h2>

<h3>Minute 0–1 → Pick the right destination</h3>
<p>Start with the travel radius. Use Google Maps or your favorite travel app to find towns or regions within your range. Choose a destination aligned with your trip style: beaches for relaxation, a small city for culture, countryside for hiking.</p>

<h3>Minute 1–2 → Book fast, smart lodging</h3>
<ul>
  <li><strong>Pick one central base:</strong> a small town center, harbor, or village — this reduces driving time between sights.</li>
  <li><strong>Use filters:</strong> set price, free cancellation, and “highly rated.”</li>
  <li><strong>Pro tip:</strong> for a cozy weekend pick a boutique B&B or a well-reviewed guesthouse — it becomes part of the experience.</li>
</ul>

<h3>Minute 2–3 → Choose one headline activity + one backup</h3>
<p>Identify one “headline” thing you really want (a winery tour, a scenic hike, a top-rated restaurant). Then choose a close backup option in case of weather or hours. Keep both within 30–45 minutes of your lodging.</p>

<h3>Minute 3–4 → Map the route</h3>
<p>Open your maps app and pin: lodging → headline activity → backup → a nice spot for coffee or sunset. This gives you a loose sequence and prevents back-and-forth drives.</p>

<h3>Minute 4–5 → Pack & prep checklist</h3>
<ul>
  <li>Charging cables, power bank, and comfortable shoes.</li>
  <li>Travel documents & wallet.</li>
  <li>Weather-appropriate layer and a water bottle.</li>
  <li>Screenshots or downloaded maps if cell service is spotty.</li>
</ul>

<h2>Bonus tips to upgrade the weekend</h2>
<ul>
  <li><strong>Book one meal:</strong> Reserve a table at your headline spot to avoid wait times.</li>
  <li><strong>Local tip:</strong> Ask the host for a nearby hidden gem — local suggestions beat search results.</li>
  <li><strong>Keep it flexible:</strong> Aim for “three good things” each day, not a packed schedule.</li>
</ul>

<h2>Quick sample itinerary (example)</h2>
<p><strong>Friday evening:</strong> Drive 2 hours, check into B&B, quick neighborhood stroll and dinner.<br />
<strong>Saturday:</strong> Morning hike (headline), lunch at market, afternoon winery (backup option). Evening: relax.<br />
<strong>Sunday:</strong> Local breakfast, short museum or viewpoint, drive home.</p>

<h2>Why this method beats overplanning</h2>
<p>When you spend hours planning, expectations climb and spontaneity drops. The 5-minute plan focuses on what matters — three memorable experiences, manageable travel, and fewer headaches. You’ll return rested, not exhausted.</p>

<h2>Ready to plan even faster?</h2>
<p>If you want a tool that builds this plan automatically, tries multiple optimized routes, and shows time & cost estimates — <a href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB" target="_blank" rel="noopener noreferrer">check out PlaPlan</a>. It creates weekend-ready itineraries in seconds so you can get out the door sooner.</p>
`,
    },
    '10-travel-planning-tips': {
        slug: '10-travel-planning-tips',
        title: '10 Smart Travel Planning Tips You Can Learn from AI (Even Without Using One)',
        date: '2025-11-03',
        readingMinutes: 6,
        cover: '/assets/blog-covers/10-travel-tips.jpg',
        content: `
<h2>🌍 Why Smart Travel Planning Matters</h2>
<p>We’ve all been there — the excitement of planning a new trip quickly turns into stress.  
Too many tabs, too many options, and not enough time to organize them all.</p>

<p>That’s why <strong>AI-powered travel planners</strong> like <a href="https://plaplan.io" target="_blank" rel="noopener noreferrer">PlaPlan</a> are changing how travelers organize trips.  
But even if you prefer planning manually, there’s a lot you can learn from how AI systems think about trip optimization.</p>

<hr />

<h2>🧠 1. Start with the Goal, Not the Destination</h2>
<p>Before picking a place, ask yourself <em>what kind of experience</em> you want:  
Relaxation? Adventure? Food discovery? Culture?</p>

<p>AI trip planners start with this intent first — they identify your mood and travel goals, then match destinations that fit perfectly.  
Try doing the same: define the goal, and your itinerary will instantly become more meaningful.</p>

<hr />

<h2>🗓️ 2. Always Plan by Days, Not Lists</h2>
<p>One common mistake humans make is building unordered lists of places to visit.  
AI systems like <strong>PlaPlan</strong> automatically organize stops by <em>day</em> and <em>distance</em> — creating smooth, time-efficient routes.</p>

<p>Pro tip: Use a spreadsheet or digital planner and assign each attraction to a specific day.  
It immediately removes stress and helps you visualize your entire journey clearly.</p>

<hr />

<h2>📍 3. Optimize for Distance and Travel Time</h2>
<p>AI planners calculate driving, walking, or train times between points — something most people forget until it’s too late.</p>

<p>When planning manually, use <strong>Google Maps</strong> or <strong>Apple Maps</strong> to estimate time between stops and arrange them logically.  
You’ll enjoy more and travel less.</p>

<hr />

<h2>💰 4. Include an Estimated Budget from the Start</h2>
<p>Budget surprises are the #1 reason people stress about travel.  
AI planners usually estimate <em>average accommodation, transport, and food costs</em> for each destination.</p>

<p>You can do this too:
<ul>
  <li>💸 Note down estimated prices per day.</li>
  <li>🛏️ Include your accommodation average cost.</li>
  <li>🍽️ Add a 10–15% buffer for unexpected expenses.</li>
</ul>
With this method, you’ll know exactly what your trip will cost before you book anything.</p>

<hr />

<h2>📅 5. Travel During the Optimal Season</h2>
<p>AI tools analyze climate data and local events to recommend the <strong>best months to visit</strong>.  
This single factor can completely change your travel experience — fewer crowds, better weather, and lower prices.</p>

<p>For example, instead of Paris in August (when locals leave), try late May or early October — same charm, half the crowd.</p>

<hr />

<h2>🤝 6. Mix Must-Sees with Hidden Gems</h2>
<p>One of the best things AI planners do is balance famous landmarks with <em>lesser-known gems</em>.</p>

<p>Humans often go to the same 10 attractions everyone else does — but real magic happens in small cafes, quiet viewpoints, or local art spots.  
When building your trip, include at least one “unknown” place per day. It makes every journey unique.</p>

<hr />

<h2>📸 7. Leave Space for Serendipity</h2>
<p>Even the smartest algorithm can’t predict when you’ll find a perfect sunset spot or a new friend.  
Don’t overschedule. Leave gaps in your plan for spontaneous discoveries — that’s what transforms a trip into a story.</p>

<p>AI like <strong>PlaPlan</strong> already accounts for this by adding flexible time windows to your itinerary — a good habit to learn from.</p>

<hr />

<h2>📊 8. Track Your Journey</h2>
<p>AI planners don’t stop after creating your itinerary — they help you <strong>track progress</strong> and adjust in real-time.</p>

<p>You can do the same: take short notes, photos, or map pins during your trip.  
Not only will this help you remember details, but it’ll also make your next planning process even smarter.</p>

<hr />

<h2>🔁 9. Reuse and Improve</h2>
<p>AI systems learn from past behavior — you should too.  
After each trip, look back at what worked and what didn’t. Did you spend too much time in cities? Did you miss nature?  
Apply those insights to your next adventure.</p>

<hr />

<h2>🚀 10. Combine AI + Human Creativity</h2>
<p>AI can handle data, logistics, and structure — but <strong>you</strong> bring the curiosity, emotions, and story.  
The best travel experiences come from combining both.</p>

<p>Use an AI planner like <a href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB" target="_blank" rel="noopener noreferrer"><strong>PlaPlan</strong></a> to do the heavy lifting, then personalize your trip with what truly inspires you.</p>

<hr />

<h2>🌎 Final Thoughts</h2>
<p>Whether you prefer spreadsheets, journals, or AI apps — planning smarter means <strong>traveling happier</strong>.</p>

<p>Let AI handle the details so you can focus on the moments that matter most — the sights, the smells, and the stories you’ll bring home.</p>

<p><strong>Ready to see how easy it can be?</strong><br />
<a href="https://plaplan.io" target="_blank" rel="noopener noreferrer">Plan your next adventure with PlaPlan</a> — your AI-powered travel companion that turns ideas into journeys.</p>
        `
    }
};


type Props = { params: { slug: string } };

// export async function generateStaticParams() {
//     return posts.map((post) => ({
//         slug: post.slug,
//     }));
// }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const post = POSTS[params.slug];

    if (!post) {
        return {
            title: 'Post Not Found | PlaPlan Blog',
        };
    }

    return {
        title: `${post.title} | PlaPlan Travel Blog`,
        description: post.excerpt || `${post.title} - Read more on PlaPlan travel planning blog`,
        keywords: `${post.tags?.join(', ')}, travel planning, AI travel planner`,
        authors: [{ name: 'PlaPlan Team' }],
        openGraph: {
            title: post.title,
            description: post.excerpt || post.title,
            type: 'article',
            publishedTime: post.date,
            url: `https://plaplan.io/blog/${post.slug}`,
            images: [
                {
                    url: post.cover ? `https://plaplan.io${post.cover}` : 'https://plaplan.io/og-default.png',
                    width: 1200,
                    height: 630,
                    alt: post.title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: post.title,
            description: post.excerpt || post.title,
            images: [post.cover || '/og-default.png'],
        },
        alternates: {
            canonical: `https://plaplan.io/blog/${post.slug}`,
        },
    };
}

export default function BlogPostPage({ params }: Props) {
    const slug = params.slug;
    const post = POSTS[slug];

    // useEffect(() => {
    //     document.documentElement.classList.add('.');
    // }, []);

    if (!post) {
        return (
            <div className="container mx-auto px-6 py-24 max-w-4xl">
                <h2 className="text-2xl font-bold mb-4">Post not found</h2>
                <p className="text-muted-foreground mb-6">We couldn't find the article you're looking for.</p>
                <Link href="/blog" className="text-primary font-semibold">Back to articles</Link>
            </div>
        );
    }

    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt,
        image: post.cover ? `https://plaplan.io${post.cover}` : undefined,
        datePublished: post.date,
        dateModified: post.date,
        author: {
            '@type': 'Organization',
            name: 'PlaPlan',
        },
        publisher: {
            '@type': 'Organization',
            name: 'PlaPlan',
            logo: {
                '@type': 'ImageObject',
                url: 'https://plaplan.io/logo.png',
            },
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://plaplan.io/blog/${post.slug}`,
        },
        keywords: post.tags?.join(', '),
        articleSection: 'Travel Planning',
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://plaplan.io',
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: 'Blog',
                item: 'https://plaplan.io/blog',
            },
            {
                '@type': 'ListItem',
                position: 3,
                name: post.title,
                item: `https://plaplan.io/blog/${post.slug}`,
            },
        ],
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <div className="text-foreground">
                <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-20 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse" />
                    <div className="absolute bottom-1/4 -right-40 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
                </div>

                <div className="relative z-10 container mx-auto px-6 py-16 md:py-24 max-w-3xl">
                    <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4" /> Back to articles
                    </Link>

                    <article className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                        {post.cover && (
                            <div className="relative h-64 md:h-96">
                                <Image
                                    src={post.cover}
                                    alt={post.title}
                                    fill
                                    className="object-cover"
                                    priority
                                />
                                <div className="absolute bottom-4 left-6 bg-black/30 backdrop-blur-sm px-3 py-1 rounded-md text-white text-xs">
                                    <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time> • {post.readingMinutes} min read
                                </div>
                            </div>
                        )}

                        <div className="p-6 md:p-10">
                            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">{post.title}</h1>

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex gap-2 mb-6">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div
                                className="prose prose-lg max-w-none text-muted-foreground blog-content"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />

                            <div className="mt-10 pt-8 border-t border-border">
                                <p className="text-sm text-muted-foreground mb-4">Enjoyed this article? Try PlaPlan — create a travel plan in seconds.</p>
                                <Link
                                    href="https://apps.apple.com/pt/app/plaplan/id6751006510?l=en-GB"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition-all"
                                >
                                    Download on the App Store
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </div>
        </>
    );
}