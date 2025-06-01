import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useQueryClient } from "@tanstack/react-query";

interface SearchFormData {
  name?: string;
  email?: string;
  company?: string;
  role?: string;
  industry?: string;
  minExperience?: number;
  maxExperience?: number;
  degree?: string;
  degreeTitle?: string;
  available?: boolean;
}

const schema = yup
  .object()
  .shape({
    name: yup.string(),
    email: yup.string().email("Invalid email format"),
    company: yup.string(),
    role: yup.string(),
    industry: yup.string(),
    minExperience: yup.number().min(0).max(100),
    maxExperience: yup.number().min(0).max(100),
    degree: yup.string(),
    degreeTitle: yup.string(),
    available: yup.boolean(),
  })
  .test("experience", "Min experience must be less than max experience", function (value) {
    if (value.minExperience && value.maxExperience) {
      return value.minExperience <= value.maxExperience;
    }
    return true;
  }) as yup.ObjectSchema<SearchFormData>;

export default function SearchSection() {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SearchFormData>({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data: SearchFormData) => {
    // Remove undefined values
    const filters = Object.fromEntries(Object.entries(data).filter(([_, value]) => value !== undefined));
    queryClient.setQueryData(["candidates", "filters"], filters);
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-8">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="name" className="label">
              Name
            </label>
            <input type="text" id="name" {...register("name")} className="input" placeholder="Search by name" />
          </div>

          <div>
            <label htmlFor="email" className="label">
              Email
            </label>
            <input type="email" id="email" {...register("email")} className="input" placeholder="Search by email" />
            {errors.email && <p className="error">{errors.email.message}</p>}
          </div>

          <div>
            <label htmlFor="company" className="label">
              Company
            </label>
            <input
              type="text"
              id="company"
              {...register("company")}
              className="input"
              placeholder="Search by company"
            />
          </div>

          <div>
            <label htmlFor="role" className="label">
              Role
            </label>
            <input type="text" id="role" {...register("role")} className="input" placeholder="Search by role" />
          </div>

          <div>
            <label htmlFor="industry" className="label">
              Industry
            </label>
            <input
              type="text"
              id="industry"
              {...register("industry")}
              className="input"
              placeholder="Search by industry"
            />
          </div>

          <div>
            <label htmlFor="degree" className="label">
              Degree
            </label>
            <input type="text" id="degree" {...register("degree")} className="input" placeholder="Search by degree" />
          </div>

          <div>
            <label htmlFor="degreeTitle" className="label">
              Degree Title
            </label>
            <input
              type="text"
              id="degreeTitle"
              {...register("degreeTitle")}
              className="input"
              placeholder="Search by degree title"
            />
          </div>

          <div>
            <label htmlFor="minExperience" className="label">
              Min Experience (years)
            </label>
            <input
              type="number"
              id="minExperience"
              {...register("minExperience")}
              className="input"
              min="0"
              max="100"
            />
            {errors.minExperience && <p className="error">{errors.minExperience.message}</p>}
          </div>

          <div>
            <label htmlFor="maxExperience" className="label">
              Max Experience (years)
            </label>
            <input
              type="number"
              id="maxExperience"
              {...register("maxExperience")}
              className="input"
              min="0"
              max="100"
            />
            {errors.maxExperience && <p className="error">{errors.maxExperience.message}</p>}
          </div>

          <div className="flex items-center">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                {...register("available")}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Available for work</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </div>
      </form>
    </div>
  );
}
