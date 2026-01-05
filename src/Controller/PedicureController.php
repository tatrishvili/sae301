<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;

final class PedicureController extends AbstractController
{
    #[Route('/pedicure', name: 'app_pedicure')]
    public function index(): Response
    {
        return $this->render('pedicure/pedicure.html.twig', [
            'page_title' => 'Pedicure',
        ]);
    }
}
