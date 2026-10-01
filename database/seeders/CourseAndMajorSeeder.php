<?php

namespace Database\Seeders;

use App\Models\Course;
use App\Models\Major;
use Illuminate\Database\Seeder;

class CourseAndMajorSeeder extends Seeder
{
    public function run(): void
    {
        $courses = [
            ['code' => 'elementary_education', 'label' => 'Bachelor of Elementary Education', 'sort_order' => 1, 'majors' => []],
            ['code' => 'culture_arts_education', 'label' => 'Bachelor of Culture and Arts Education', 'sort_order' => 2, 'majors' => []],
            ['code' => 'physical_education', 'label' => 'Bachelor of Physical Education', 'sort_order' => 3, 'majors' => []],
            ['code' => 'early_childhood_education', 'label' => 'Bachelor of Early Childhood Education', 'sort_order' => 4, 'majors' => []],
            [
                'code' => 'secondary_education',
                'label' => 'Bachelor of Secondary Education',
                'sort_order' => 5,
                'majors' => [
                    ['code' => 'filipino', 'label' => 'Filipino'],
                    ['code' => 'mathematics', 'label' => 'Mathematics'],
                    ['code' => 'science', 'label' => 'Science'],
                    ['code' => 'english', 'label' => 'English'],
                    ['code' => 'social_studies', 'label' => 'Social Studies'],
                    ['code' => 'values_education', 'label' => 'Values Education'],
                ]
            ],
            [
                'code' => 'tech_livelihood_education',
                'label' => 'Bachelor of Technology and Livelihood Education',
                'sort_order' => 6,
                'majors' => [
                    ['code' => 'agri_fishery_arts', 'label' => 'Agri-Fishery and Arts'],
                    ['code' => 'home_economics', 'label' => 'Home Economics'],
                    ['code' => 'industrial_arts', 'label' => 'Industrial Arts'],
                    ['code' => 'info_tech', 'label' => 'Information and Communications Technology'],
                ]
            ],
        ];

        foreach ($courses as $i => $courseData) {
            $majors = $courseData['majors'];
            unset($courseData['majors']);

            $course = Course::updateOrCreate(['code' => $courseData['code']], $courseData);

            foreach ($majors as $j => $majorData) {
                Major::updateOrCreate(
                    ['course_id' => $course->id, 'code' => $majorData['code']],
                    [...$majorData, 'course_id' => $course->id, 'sort_order' => $j + 1]
                );
            }
        }
    }
}