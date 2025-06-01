import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useState } from "react";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";
import { TrashIcon } from "@heroicons/react/24/outline";

interface ExperienceForm {
  role: string;
  company: string;
  industry: string;
  startDate: string;
  endDate: string | null;
}

interface EducationForm {
  institution: string;
  title: string;
  degree: string;
  years: number | null;
}

interface CandidateFormData {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  available: boolean;
  experience: ExperienceForm[];
  education: EducationForm[];
}

const experienceSchema = yup.object().shape({
  role: yup.string().required("Role is required"),
  company: yup.string().required("Company is required"),
  industry: yup.string().required("Industry is required"),
  startDate: yup.string().required("Start date is required"),
  endDate: yup.string().nullable(),
});

const educationSchema = yup.object().shape({
  institution: yup.string().required("Institution is required"),
  title: yup.string().required("Title is required"),
  degree: yup.string().required("Degree is required"),
  years: yup.number().nullable(),
});

const schema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  address: yup.string().required("Address is required"),
  available: yup.boolean().default(true),
  experience: yup.array().of(experienceSchema).notRequired().min(0),
  education: yup.array().of(educationSchema).notRequired().min(0),
}) as yup.ObjectSchema<CandidateFormData>;

interface CandidateFormProps {
  isOpen: boolean;
  onClose: () => void;
  candidateId?: string | null;
}

export default function CandidateForm({ isOpen, onClose, candidateId }: CandidateFormProps) {
  const queryClient = useQueryClient();
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isDirty },
  } = useForm<CandidateFormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      address: "",
      available: true,
      experience: [],
      education: [],
    },
  });

  const {
    fields: experienceFields,
    append: appendExperience,
    remove: removeExperience,
  } = useFieldArray({
    control,
    name: "experience",
  });

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: "education",
  });

  const { data: candidate } = useQuery({
    queryKey: ["candidate", candidateId],
    queryFn: async () => {
      if (!candidateId) return null;
      const response = await axios.get(`http://localhost:3010/api/candidates/${candidateId}`);
      return response.data;
    },
    enabled: !!candidateId,
  });

  useEffect(() => {
    if (candidate) {
      reset(candidate);
    }
  }, [candidate, reset]);

  const mutation = useMutation({
    mutationFn: async (data: CandidateFormData) => {
      if (!candidateId && resumeFile) {
        const formData = new FormData();
        formData.append("candidate", JSON.stringify(data));
        formData.append("resume", resumeFile);
        return axios.post("http://localhost:3010/api/candidates", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      if (candidateId) {
        return axios.put(`http://localhost:3010/api/candidates/${candidateId}`, data);
      }
      return axios.post("http://localhost:3010/api/candidates", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success(candidateId ? "Candidate updated successfully" : "Candidate created successfully");
      onClose();
    },
    onError: () => {
      toast.error("Something went wrong");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await axios.delete(`http://localhost:3010/api/candidates/${candidateId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["candidates"] });
      toast.success("Candidate deleted successfully");
      onClose();
    },
    onError: () => {
      toast.error("Failed to delete candidate");
    },
  });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      setResumeFile(acceptedFiles[0] || null);
    },
  });

  const onSubmit: SubmitHandler<CandidateFormData> = (data) => {
    const experience = data.experience?.map((exp) => ({
      ...exp,
      startDate: exp.startDate ? new Date(exp.startDate).toISOString() : "",
      endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
    }));
    mutation.mutate({ ...data, experience });
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                  {candidateId ? "Edit Candidate" : "Add New Candidate"}
                </Dialog.Title>

                <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="label">
                        First Name
                      </label>
                      <input type="text" id="firstName" {...register("firstName")} className="input" />
                      {errors.firstName && <p className="error">{errors.firstName.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="lastName" className="label">
                        Last Name
                      </label>
                      <input type="text" id="lastName" {...register("lastName")} className="input" />
                      {errors.lastName && <p className="error">{errors.lastName.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="email" className="label">
                        Email
                      </label>
                      <input type="email" id="email" {...register("email")} className="input" />
                      {errors.email && <p className="error">{errors.email.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="address" className="label">
                        Address
                      </label>
                      <input type="text" id="address" {...register("address")} className="input" />
                    </div>
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

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-gray-900">Experience</h4>
                      <button
                        type="button"
                        onClick={() =>
                          appendExperience({ role: "", company: "", industry: "", startDate: "", endDate: null })
                        }
                        className="btn btn-secondary"
                      >
                        Add Experience
                      </button>
                    </div>

                    {experienceFields.length === 0 && <div className="text-gray-400 italic">No experience added</div>}

                    {experienceFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between">
                          <h5 className="font-medium">Experience {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeExperience(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Role</label>
                            <input {...register(`experience.${index}.role`)} className="input" />
                            {errors.experience?.[index]?.role && (
                              <p className="error">{errors.experience[index]?.role?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Company</label>
                            <input {...register(`experience.${index}.company`)} className="input" />
                            {errors.experience?.[index]?.company && (
                              <p className="error">{errors.experience[index]?.company?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Industry</label>
                            <input {...register(`experience.${index}.industry`)} className="input" />
                            {errors.experience?.[index]?.industry && (
                              <p className="error">{errors.experience[index]?.industry?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Start Date</label>
                            <input type="date" {...register(`experience.${index}.startDate`)} className="input" />
                            {errors.experience?.[index]?.startDate && (
                              <p className="error">{errors.experience[index]?.startDate?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">End Date</label>
                            <input type="date" {...register(`experience.${index}.endDate`)} className="input" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-medium text-gray-900">Education</h4>
                      <button
                        type="button"
                        onClick={() => appendEducation({ institution: "", title: "", degree: "", years: null })}
                        className="btn btn-secondary"
                      >
                        Add Education
                      </button>
                    </div>

                    {educationFields.length === 0 && <div className="text-gray-400 italic">No education added</div>}

                    {educationFields.map((field, index) => (
                      <div key={field.id} className="p-4 border rounded-lg space-y-4">
                        <div className="flex justify-between">
                          <h5 className="font-medium">Education {index + 1}</h5>
                          <button
                            type="button"
                            onClick={() => removeEducation(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="label">Institution</label>
                            <input {...register(`education.${index}.institution`)} className="input" />
                            {errors.education?.[index]?.institution && (
                              <p className="error">{errors.education[index]?.institution?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Title</label>
                            <input {...register(`education.${index}.title`)} className="input" />
                            {errors.education?.[index]?.title && (
                              <p className="error">{errors.education[index]?.title?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Degree</label>
                            <input {...register(`education.${index}.degree`)} className="input" />
                            {errors.education?.[index]?.degree && (
                              <p className="error">{errors.education[index]?.degree?.message}</p>
                            )}
                          </div>
                          <div>
                            <label className="label">Years</label>
                            <input type="number" {...register(`education.${index}.years`)} className="input" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4">
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                        isDragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-500"
                      }`}
                    >
                      <input {...getInputProps()} />
                      <p className="text-gray-600">
                        {isDragActive
                          ? "Drop the resume here"
                          : "Drag and drop your resume here, or click to select file"}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, DOC, DOCX</p>
                      {resumeFile && <div className="mt-2 text-primary-700 text-sm">Selected: {resumeFile.name}</div>}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    {candidateId && (
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to delete this candidate?")) {
                            deleteMutation.mutate();
                          }
                        }}
                        className="btn btn-danger flex items-center gap-2"
                        disabled={deleteMutation.isPending}
                      >
                        <TrashIcon className="h-5 w-5" />
                        {deleteMutation.isPending ? "Deleting..." : "Delete"}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        if (isDirty) {
                          if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
                            onClose();
                          }
                        } else {
                          onClose();
                        }
                      }}
                      className="btn btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={mutation.isPending || deleteMutation.isPending}
                    >
                      {mutation.isPending ? "Saving..." : candidateId ? "Update" : "Create"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
