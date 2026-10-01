<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    protected static ?string $password;

    public function definition(): array
    {
        return [
            'first_name' => fake()->firstName(),
            'last_name' => fake()->lastName(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => static::$password ??= bcrypt('password'),
            'remember_token' => Str::random(10),
            'user_type' => 'student',
            'student_number' => fake()->unique()->numerify('####-#####'),
            // course_id/major_id intentionally left unset here — nullable,
            // and only meaningful once Course/Major models exist to
            // reference. Set them explicitly per-test/seeder when needed,
            // e.g. User::factory()->create(['course_id' => $course->id]).
        ];
    }

    /** Convenience state for creating an admin user via the factory. */
    public function admin(): static
    {
        return $this->state(fn(array $attributes) => [
            'user_type' => 'admin',
            'student_number' => null,
        ]);
    }

    public function unverified(): static
    {
        return $this->state(fn(array $attributes) => [
            'email_verified_at' => null,
        ]);
    }
}