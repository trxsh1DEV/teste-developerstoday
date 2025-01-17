'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { z } from 'zod';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useUserStore } from '@/store/userStore';
import { useTranslations } from 'next-intl';
import axios from 'axios';

const fileSizeLimit = 100 * 1024 * 1024; // 100MB

export const FormDataSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  country: z.string().min(1, 'Country is required'),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  zip: z.string().min(1, 'Zip is required'),
  video: z
    .any()
    .refine(
      (file) => {
        return file ? file['0'] instanceof File : undefined;
      },
      {
        message: 'Must be a valid file',
      }
    )
    .refine(
      (file) => {
        // console.log(file.size <= fileSizeLimit)
        return file ? file['0'].size <= fileSizeLimit : undefined;
      },
      {
        message: 'File size should not exceed 100MB',
      }
    )
    .refine(
      (file) =>
        file &&
        file['0'] &&
        ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'].includes(
          file['0'].type
        ),
      {
        message: 'Unsupported video format',
      }
    ),
});

type Inputs = z.infer<typeof FormDataSchema>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getSteps = (t: any) => [
  {
    id: t('Form.steps.step1.id'),
    name: t('Form.steps.step1.name'),
    fields: ['firstName', 'lastName', 'email'],
  },
  {
    id: t('Form.steps.step2.id'),
    name: t('Form.steps.step2.name'),
    fields: ['country', 'state', 'city', 'street', 'zip'],
  },
  {
    id: t('Form.steps.step3.id'),
    name: t('Form.steps.step3.name'),
    fields: ['video'],
  },
  {
    id: t('Form.steps.step4.id'),
    name: t('Form.steps.step4.name'),
  },
];

export default function FormMultiStep() {
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  // const fileRef = useRef<HTMLInputElement>(null);
  const user = useUserStore((state) => state.user);
  const delta = currentStep - previousStep;
  const t = useTranslations('');
  const steps = getSteps(t);

  const {
    register,
    handleSubmit,
    reset,
    control,
    trigger,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: {
      email: user?.email || '',
      firstName: user?.name?.split(' ')[0] || '',
      lastName: user?.name?.split(' ')[1] || '',
    },
  });

  useEffect(() => {
    if (user?.email && user?.name) {
      reset({
        email: user.email,
        firstName: user.name.split(' ')[0],
        lastName: user.name.split(' ')[1],
      });
    }
  }, [user, reset]);

  const processForm: SubmitHandler<Inputs> = async (data) => {
    // Append video if exists
    data.video = data.video?.[0] || null;

    try {
      // console.log('Form data:', Object.fromEntries(formData));
      const response = await axios.post(`http://localhost:3333/users`, data);

      // Trated file video
      const formDataVideo = new FormData();
      console.log(data.video);
      if (data.video && data.video instanceof File) {
        formDataVideo.append('video', data.video);
        const responseVideo = await axios.post(
          `http://localhost:3333/courses`,
          formDataVideo
        );
        console.log(responseVideo.data);
      }
      console.log(response.data);
      // Handle success
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      // reset();
    }
  };
  // const processForm: SubmitHandler<Inputs> = async (data) => {
  //   const formData = new FormData();

  //   // Append all text fields
  //   Object.entries(data).forEach(([key, value]) => {
  //     if (key !== 'video') {
  //       formData.append(key, value);
  //     }
  //   });

  //   // Append video if exists
  //   if (data.video && data.video[0] instanceof File) {
  //     formData.append('video', data.video[0]);
  //   }

  //   try {
  //     console.log('Form data:', Object.fromEntries(formData));
  //     const response = await fetch(`http://localhost:3333/users`, {
  //       method: 'POST',
  //       body: formData,
  //     });
  //     if (!response.ok) throw new Error('Form submission failed');
  //     // Handle success
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //   } finally {
  //     reset();
  //   }
  // };

  type FieldName = keyof Inputs;

  const next = async () => {
    const fields = steps[currentStep].fields;
    const output = await trigger(fields as FieldName[], { shouldFocus: true });

    if (!output) return;

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const renderVideoUpload = () => {
    if (currentStep !== 2) return null;

    return (
      <div className="col-span-full">
        <Label htmlFor="video">{t('Form.fields.video.label')}</Label>
        <div className="mt-2">
          <Input
            type="file"
            accept="video/*"
            {...register('video', {
              onChange: (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  setVideoPreview(URL.createObjectURL(file));
                }
              },
            })}
          />
          {videoPreview && (
            <video
              className="mt-4 max-w-full h-auto"
              controls
              src={videoPreview}
            />
          )}
          {errors.video?.message && (
            <p className="mt-2 text-sm text-red-400">
              {errors.video.message.toString()}
            </p>
          )}
        </div>
      </div>
    );
  };

  return (
    <section className="absolute inset-0 flex flex-col justify-between p-24">
      {/* steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-sky-600 transition-colors ">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">
                    {step.id}
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className="mt-12 py-12" onSubmit={handleSubmit(processForm)}>
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t('Form.steps.step1.name')}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {t('Form.steps.step1.description')}
            </p>
            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="firstName">
                  {t('Form.fields.firstName.label')}
                </Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="firstName"
                    {...register('firstName')}
                    autoComplete="given-name"
                    autoFocus={true}
                  />
                  {errors.firstName?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-3">
                <Label htmlFor="lastName">
                  {t('Form.fields.lastName.label')}
                </Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="lastName"
                    {...register('lastName')}
                    autoComplete="family-name"
                  />
                  {errors.lastName?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-4">
                <Label htmlFor="email">{t('Form.fields.email.label')}</Label>
                <div className="mt-2">
                  <Input
                    id="email"
                    type="email"
                    {...register('email')}
                    autoComplete="email"
                  />
                  {errors.email?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t('Form.steps.step2.name')}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {t('Form.steps.step2.description')}
            </p>

            <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <Label htmlFor="country">
                  {t('Form.fields.country.label')}
                </Label>
                <div className="mt-2">
                  <Controller
                    name="country"
                    control={control}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={`${t('Form.fields.country.placeholder')}`}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="United States">
                            {t('Form.fields.country.options.us')}
                          </SelectItem>
                          <SelectItem value="Canada">
                            {t('Form.fields.country.options.ca')}
                          </SelectItem>
                          <SelectItem value="Mexico">
                            {t('Form.fields.country.options.mx')}
                          </SelectItem>
                          <SelectItem value="Brazil">
                            {t('Form.fields.country.options.br')}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.country?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.country.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="col-span-full">
                <Label htmlFor="street">{t('Form.fields.street.label')}</Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="street"
                    {...register('street')}
                    autoComplete="street-address"
                  />
                  {errors.street?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.street.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2 sm:col-start-1">
                <Label htmlFor="city">{t('Form.fields.city.label')}</Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="city"
                    {...register('city')}
                    autoComplete="address-level2"
                  />
                  {errors.city?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.city.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="state">{t('Form.fields.state.label')}</Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="state"
                    {...register('state')}
                    autoComplete="address-level1"
                  />
                  {errors.state?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.state.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="zip">{t('Form.fields.zip.label')}</Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    id="zip"
                    {...register('zip')}
                    autoComplete="postal-code"
                  />
                  {errors.zip?.message && (
                    <p className="mt-2 text-sm text-red-400">
                      {errors.zip.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {currentStep === 2 && <>{renderVideoUpload()}</>}
        {currentStep === 3 && (
          <>
            <h2 className="text-base font-semibold leading-7 text-gray-900">
              {t('Form.steps.step4.name')}
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              {t('Form.steps.step4.description')}
            </p>
          </>
        )}
      </form>

      {/* Navigation */}
      <div className="mt-8 py-4">
        <div className="flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-sky-900 shadow-sm ring-1 ring-inset ring-sky-300 hover:bg-sky-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8.25 4.5l7.5 7.5-7.5 7.5"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
