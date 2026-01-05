<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ManucureController extends AbstractController
{
    #[Route('/manucure', name: 'app_manucure')]
    public function index(): Response
    {
        return $this->render('manucure/manucure.html.twig', [
            'page_title' => 'Manucure',
        ]);
    }
}
