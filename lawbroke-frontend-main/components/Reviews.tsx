import Review from "./Review";

interface ReviewData {
  rating: number;
  title: string;
  content: string;
  author: string;
  designation: string;
}

interface ReviewsProps {
  reviews?: ReviewData[];
}

const defaultReviews: ReviewData[] = [
  {
    rating: 5,
    title: "Encouraging and insightful",
    content:
      "LawBroke was a game-changer for me. I only decided to go to court because of using LawBroke's case predictor.",
    author: "Jonas Aly",
    designation: "Founder",
  },
  {
    rating: 3,
    title: "Effective, but controversial",
    content:
      "The crowd funding is helpful for clients getting justice - but I don't know how I feel about investors being able to make returns off of legal cases.",
    author: "Mark Bures",
    designation: "Businessman",
  },
  {
    rating: 5,
    title: "Possibly saved me and my kids' lives",
    content:
      "LawBroke's 'damning data' updates, revealed that a freed repeat violent offender had just moved near us.",
    author: "Chelsea",
    designation: "Mother",
  },
  {
    rating: 4,
    title: "Puts you back in control",
    content:
      "LawBroke let me see real performance data for potential barristers, so I wasn’t just trusting the solicitor choice blindly.",
    author: "Andrew",
    designation: "Manager",
  },
];

const Reviews: React.FC<ReviewsProps> = ({ reviews = defaultReviews }) => {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl sm:text-3xl md:text-4xl lg:text-5xl text-center mb-8 text-gray-900 dark:text-white">
          Latest reviews
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
          {reviews.map((review, index) => (
            <Review key={index} {...review} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Reviews;
