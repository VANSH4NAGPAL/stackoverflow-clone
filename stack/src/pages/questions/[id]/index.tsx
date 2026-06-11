import QuestionDetail from "@/components/QuestionDetail";
import Mainlayout from "@/layout/Mainlayout";
import { useRouter } from "next/router";

const QuestionPage = () => {
  const router = useRouter();
  const { id } = router.query;

  if (!id) {
    return (
      <Mainlayout>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </Mainlayout>
    );
  }

  return (
    <Mainlayout>
      <div className="p-4 lg:p-6">
        <QuestionDetail questionId={id as string} />
      </div>
    </Mainlayout>
  );
};

export default QuestionPage;
