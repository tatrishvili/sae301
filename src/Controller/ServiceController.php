<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class ServiceController extends AbstractController
{
    #[Route('/', name: 'app_service')]
    public function index(): Response
    {
        return $this->render('service/service.html.twig', [
            'page_title' => 'Services',
        ]);
    }
}
