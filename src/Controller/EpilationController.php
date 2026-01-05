<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class EpilationController extends AbstractController
{
    #[Route('/epilation', name: 'app_epilation')]
    public function index(): Response
    {
        return $this->render('epilation/epilation.html.twig', [
            'page_title' => 'Epilation',
        ]);
    }
}
