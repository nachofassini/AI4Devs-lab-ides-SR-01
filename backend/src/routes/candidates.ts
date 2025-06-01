import { Router } from 'express';
import { prisma } from '../index';
import { AppError } from '../middleware/errorHandler';
import { Candidate, Education, Experience } from '@prisma/client';
import multer from 'multer';
import path from 'path';

const router = Router();

interface CandidateWithRelations extends Candidate {
  education: Education[];
  experience: Experience[];
}

const upload = multer({
  dest: path.join(__dirname, '../../uploads'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// Get all candidates with filters
router.get('/', async (req, res, next) => {
  try {
    const {
      name,
      email,
      company,
      role,
      industry,
      minExperience,
      maxExperience,
      degree,
      degreeTitle,
      available,
    } = req.query;

    const where: any = {};

    if (name) {
      where.OR = [
        { firstName: { contains: name as string, mode: 'insensitive' } },
        { lastName: { contains: name as string, mode: 'insensitive' } },
      ];
    }

    if (email) {
      where.email = { contains: email as string, mode: 'insensitive' };
    }

    if (available !== undefined) {
      where.available = available === 'true';
    }

    const candidates = (await prisma.candidate.findMany({
      where,
      include: {
        education: true,
        experience: true,
      },
    })) as CandidateWithRelations[];

    // Apply additional filters in memory for complex queries
    const filteredCandidates = candidates.filter(
      (candidate: CandidateWithRelations) => {
        if (
          company &&
          !candidate.experience.some((exp: Experience) =>
            exp.company
              .toLowerCase()
              .includes((company as string).toLowerCase()),
          )
        )
          return false;

        if (
          role &&
          !candidate.experience.some((exp: Experience) =>
            exp.role.toLowerCase().includes((role as string).toLowerCase()),
          )
        )
          return false;

        if (
          industry &&
          !candidate.experience.some((exp: Experience) =>
            exp.industry
              .toLowerCase()
              .includes((industry as string).toLowerCase()),
          )
        )
          return false;

        if (
          degree &&
          !candidate.education.some((edu: Education) =>
            edu.degree.toLowerCase().includes((degree as string).toLowerCase()),
          )
        )
          return false;

        if (
          degreeTitle &&
          !candidate.education.some((edu: Education) =>
            edu.title
              .toLowerCase()
              .includes((degreeTitle as string).toLowerCase()),
          )
        )
          return false;

        if (minExperience || maxExperience) {
          const totalExperience = candidate.experience.reduce(
            (total: number, exp: Experience) => {
              const start = new Date(exp.startDate);
              const end = exp.endDate ? new Date(exp.endDate) : new Date();
              const years =
                (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 365);
              return total + years;
            },
            0,
          );

          if (minExperience && totalExperience < Number(minExperience))
            return false;
          if (maxExperience && totalExperience > Number(maxExperience))
            return false;
        }

        return true;
      },
    );

    res.json(filteredCandidates);
  } catch (error) {
    next(error);
  }
});

// Get single candidate
router.get('/:id', async (req, res, next) => {
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.params.id },
      include: {
        education: true,
        experience: true,
      },
    });

    if (!candidate) {
      throw new AppError('Candidate not found', 404);
    }

    res.json(candidate);
  } catch (error) {
    next(error);
  }
});

// Create candidate
router.post('/', upload.single('resume'), async (req, res, next) => {
  try {
    let candidateData;
    let education = [];
    let experience = [];
    if (req.is('multipart/form-data')) {
      // Parse candidate JSON from form field
      candidateData = JSON.parse(req.body.candidate);
      education = candidateData.education || [];
      experience = candidateData.experience || [];
    } else {
      candidateData = req.body;
      education = candidateData.education || [];
      experience = candidateData.experience || [];
    }

    // If file uploaded, set resumeUrl
    if (req.file) {
      candidateData.resumeUrl = `/uploads/${req.file.filename}`;
    }

    const candidate = await prisma.candidate.create({
      data: {
        ...candidateData,
        education: {
          create: education,
        },
        experience: {
          create: experience,
        },
      },
      include: {
        education: true,
        experience: true,
      },
    });

    res.status(201).json(candidate);
  } catch (error) {
    next(error);
  }
});

// Update candidate
router.put('/:id', async (req, res, next) => {
  try {
    const { education, experience, ...candidateData } = req.body;

    // Delete existing education and experience
    await prisma.education.deleteMany({
      where: { candidateId: req.params.id },
    });
    await prisma.experience.deleteMany({
      where: { candidateId: req.params.id },
    });

    const candidate = await prisma.candidate.update({
      where: { id: req.params.id },
      data: {
        ...candidateData,
        education: {
          create: education,
        },
        experience: {
          create: experience,
        },
      },
      include: {
        education: true,
        experience: true,
      },
    });

    res.json(candidate);
  } catch (error) {
    next(error);
  }
});

// Delete candidate
router.delete('/:id', async (req, res, next) => {
  try {
    await prisma.candidate.delete({
      where: { id: req.params.id },
    });

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
