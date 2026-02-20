import CreateAnimalPost from '../_components/CreateAnimalPostForm';

export default function CreateAnimalPostPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Create New Animal Post</h1>
        <p className="text-gray-600 mt-1">Add a new animal available for adoption</p>
      </div>
      <CreateAnimalPost />
    </div>
  );
}