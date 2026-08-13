// Placeholder posts shaped to the `community_posts` columns in docs/SCHEMA.md.
// Author display names stand in for a profiles join the services layer will do.

export type CommunityPost = {
  id: string
  author_id: string
  author_name: string
  trip_id: string | null
  activity_id: number | null
  title: string
  body: string
  image_url: string | null
  created_at: string
}

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-01',
    author_id: '00000000-0000-4000-8000-000000000002',
    author_name: 'Nadia Rahman',
    trip_id: 'trip-europe-loop',
    activity_id: 5,
    title: 'Book the Sagrada Familia for opening, not sunset',
    body: 'Everyone tells you to go late for the west windows. The queue at 17:00 was forty minutes even with a timed ticket. At 09:00 we walked straight in and had the nave nearly to ourselves for twenty minutes.',
    image_url: null,
    created_at: '2026-06-02T08:12:00Z',
  },
  {
    id: 'post-02',
    author_id: '00000000-0000-4000-8000-000000000003',
    author_name: 'Tomas Vidal',
    trip_id: null,
    activity_id: 15,
    title: 'Fushimi Inari is a different place before 07:00',
    body: 'Took the first train from Kyoto station and reached the lower gates just after six. Walked forty minutes up without passing more than a handful of people. By the time we came down it was shoulder to shoulder.',
    image_url: null,
    created_at: '2026-05-28T22:40:00Z',
  },
  {
    id: 'post-03',
    author_id: '00000000-0000-4000-8000-000000000004',
    author_name: 'Priya Anand',
    trip_id: 'trip-morocco-medinas',
    activity_id: null,
    title: 'Two nights outside Marrakesh was the right call',
    body: 'The medina is intense in a way that is wonderful for three days and exhausting by day six. Breaking it up with a stay towards the Atlas foothills reset the whole trip. We came back into the city genuinely glad to be there again.',
    image_url: null,
    created_at: '2026-04-19T14:05:00Z',
  },
  {
    id: 'post-04',
    author_id: '00000000-0000-4000-8000-000000000005',
    author_name: 'Erik Lindqvist',
    trip_id: null,
    activity_id: 19,
    title: 'The Golden Circle in October needs a longer day than you think',
    body: 'Daylight is down to about nine hours and the roads are slower than the map suggests. We left at eight and were driving the last stretch back in the dark. Worth it, but do not stack anything after it.',
    image_url: null,
    created_at: '2026-03-30T19:22:00Z',
  },
  {
    id: 'post-05',
    author_id: '00000000-0000-4000-8000-000000000006',
    author_name: 'Mei Lin Chow',
    trip_id: 'trip-baltic-rail',
    activity_id: null,
    title: 'Slovenia without a car is completely doable',
    body: 'Ljubljana to Bled is an hour by bus, running most of the day. We did the whole week on trains and buses and never once wished we had driven. The only awkward leg was the Vintgar gorge, which needs a short walk from the stop.',
    image_url: null,
    created_at: '2026-02-11T11:30:00Z',
  },
  {
    id: 'post-06',
    author_id: '00000000-0000-4000-8000-000000000007',
    author_name: 'Daniel Okafor',
    trip_id: null,
    activity_id: 9,
    title: 'Three hours at the Uffizi is the minimum, not the target',
    body: 'We budgeted two and had to walk past most of the second floor. If you only care about the headline rooms you can do it fast, but the corridors between them are half the point.',
    image_url: null,
    created_at: '2026-01-24T16:48:00Z',
  },
]
